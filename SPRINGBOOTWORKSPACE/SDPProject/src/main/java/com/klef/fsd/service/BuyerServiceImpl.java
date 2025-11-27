package com.klef.fsd.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.klef.fsd.model.Buyer;
import com.klef.fsd.model.EmailDetails;
import com.klef.fsd.repository.BuyerRepository;
import com.klef.fsd.util.JwtUtil;

@Service
public class BuyerServiceImpl implements BuyerService {

	@Autowired
	private BuyerRepository buyerRepository;
	
	
	@Autowired
	private EmailService emailService;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public String buyerRegistration(Buyer buyer) {
		buyer.setPassword(passwordEncoder.encode(buyer.getPassword()));
		buyerRepository.save(buyer);
		return "Buyer Registered Successfully";
	}

	@Override
	public Buyer updateBuyer(Buyer updated) {
		Optional<Buyer> existingOpt = buyerRepository.findById(updated.getId());
		if (existingOpt.isEmpty()) {
			throw new RuntimeException("Buyer not found");
		}
		Buyer existing = existingOpt.get();
		existing.setName(updated.getName());
		existing.setEmail(updated.getEmail());
		existing.setMobileno(updated.getMobileno());
		// do not change password here
		return buyerRepository.save(existing);
	}

	@Override
	public Buyer checkBuyerLogin(String email, String password) {
		try {
			Optional<Buyer> buyerOpt = buyerRepository.findByEmail(email);
			if (buyerOpt.isPresent()) {
				Buyer buyer = buyerOpt.get();
				
				// Debug logging to see what's happening
				System.out.println("Login attempt - Email: " + email);
				System.out.println("Stored password hash: " + buyer.getPassword());
				
				// First try with passwordEncoder.matches (for encoded passwords)
				if (passwordEncoder.matches(password, buyer.getPassword())) {
					System.out.println("Password match successful with encoder");
					return buyer;
				}
				
				// Fallback for any legacy plain text passwords
				if (password.equals(buyer.getPassword())) {
					System.out.println("Password match successful with plain text comparison");
					// Update to encoded password for future security
					buyer.setPassword(passwordEncoder.encode(password));
					buyerRepository.save(buyer);
					return buyer;
				}
				
				System.out.println("Password match failed");
			} else {
				System.out.println("No buyer found with email: " + email);
			}
		} catch (Exception e) {
			System.err.println("Error in buyer login: " + e.getMessage());
			e.printStackTrace();
		}
		return null;
	}
	
	public Map<String, Object> generateBuyerToken(Buyer buyer) {
		String token = jwtUtil.generateToken(buyer.getEmail(), "BUYER", buyer.getId());
		Map<String, Object> response = new HashMap<>();
		response.put("token", token);
		response.put("buyer", buyer);
		response.put("role", "BUYER");
		return response;
	}

	public String generateResetToken(String email) {
	    Optional<Buyer> buyerOpt = buyerRepository.findByEmail(email);
	    if (buyerOpt.isEmpty()) {
	        return "Seller not found!";
	    }

	    Buyer buyer = buyerOpt.get();
	    String resetToken = UUID.randomUUID().toString();
	    buyer.setResetToken(resetToken);
	    buyerRepository.save(buyer);

	    String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;

	    EmailDetails mail = new EmailDetails();
	    mail.setRecipient(email);
	    mail.setSubject("🔐 Reset Your Password - LL-Cart");

	    String htmlContent = "<h3>Hello from <span style='color:#2563EB;'>SAVEANDSERVE</span> 👋</h3>"
	        + "<p>We received a request to reset your password.</p>"
	        + "<p><a href=\"" + resetLink + "\" "
	        + "style='padding:10px 20px; background-color:#2563EB; color:white; text-decoration:none; border-radius:5px;'>"
	        + "Click here to reset your password</a></p>"
	        + "<p>If you didn’t request this, please ignore this email.</p>"
	        + "<br><p>Regards,<br><b>SAVE AND SERVE Support Team</b></p>";

	    mail.setMsgBody(htmlContent);
	    emailService.sendHtmlMail(mail);  // ✅ Use HTML method

	    return "Reset link sent to your email";
	}

	    @Override
	    public String resetPassword(String token, String newPassword) {
	        Buyer buyer = buyerRepository.findByResetToken(token);
	        if (buyer == null) {
	            return "Invalid token!";
	        }

	        buyer.setPassword(passwordEncoder.encode(newPassword));
	        buyer.setResetToken(null);
	        buyerRepository.save(buyer);
	        return "Password updated successfully!";
	    }
	
	
}
