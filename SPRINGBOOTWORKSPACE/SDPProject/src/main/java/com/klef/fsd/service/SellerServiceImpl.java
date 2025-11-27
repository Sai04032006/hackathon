package com.klef.fsd.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.klef.fsd.model.EmailDetails;
import com.klef.fsd.model.Seller;
import com.klef.fsd.repository.SellerRepository;
import com.klef.fsd.util.JwtUtil;

@Service
public class SellerServiceImpl implements SellerService {

	@Autowired
	private SellerRepository sellerRepository;
	
	@Autowired
	private EmailService emailService;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public String sellerRegistration(Seller seller) {
		seller.setStatus("Pending");
		seller.setPassword(passwordEncoder.encode(seller.getPassword()));
		sellerRepository.save(seller);
		return "Seller Registered Successfully!";
	}

	@Override
	public Seller checkSellerLogin(String username, String password) {
		try {
			Seller seller = sellerRepository.findByUsername(username);
			if (seller != null && "Approved".equalsIgnoreCase(seller.getStatus())) {
				// Check if password matches (handles both encrypted and plain text passwords)
				if (passwordEncoder.matches(password, seller.getPassword()) || 
					password.equals(seller.getPassword())) {
					// If it's a plain text password, encrypt it for future use
					if (password.equals(seller.getPassword())) {
						seller.setPassword(passwordEncoder.encode(password));
						sellerRepository.save(seller);
					}
					return seller;
				}
			}
		} catch (Exception e) {
			System.err.println("Error in seller login: " + e.getMessage());
		}
		return null;
	}
	
	public Map<String, Object> generateSellerToken(Seller seller) {
		String token = jwtUtil.generateToken(seller.getUsername(), "SELLER", seller.getId());
		Map<String, Object> response = new HashMap<>();
		response.put("token", token);
		response.put("seller", seller);
		response.put("role", "SELLER");
		return response;
	}

	@Override
	public List<Seller> viewPendingSellers() {
		return sellerRepository.findByStatus("Pending");
	}

	@Override
	public String approveSeller(int sellerId) {
		Optional<Seller> optionalSeller = sellerRepository.findById(sellerId);
		if (optionalSeller.isPresent()) {
			Seller seller = optionalSeller.get();
			seller.setStatus("Approved");
			sellerRepository.save(seller);
			return "Seller approved successfully.";
		} else {
			return "Seller not found.";
		}
	}

	@Override
	public String rejectSeller(int id) {
		Optional<Seller> optionalSeller = sellerRepository.findById(id);
		if (optionalSeller.isPresent()) {
			Seller seller = optionalSeller.get();
			seller.setStatus("Rejected");
			sellerRepository.save(seller);
			return "Seller rejected successfully";
		} else {
			return "Seller not found";
		}
	}

	@Override
	public String deleteSeller(int id) {
		Optional<Seller> optionalSeller = sellerRepository.findById(id);
		if (optionalSeller.isPresent()) {
			sellerRepository.deleteById(id);
			return "Seller deleted successfully";
		} else {
			return "Seller not found";
		}
	}

	@Override
	public Seller getSellerById(int sid) {

		return sellerRepository.findById(sid).get();
	}

	@Override
	public String updateSellerProfile(Seller seller) {
		Optional<Seller> optionalSeller = sellerRepository.findById(seller.getId());
		if (optionalSeller.isPresent()) {

			Seller s = optionalSeller.get();
			s.setLocation(seller.getLocation());
			s.setMobileno(seller.getMobileno());
			s.setNationalidno(seller.getNationalidno());
			s.setUsername(s.getUsername());
			s.setEmail(seller.getEmail());
			sellerRepository.save(s);
			return "Seller Updated Successfully";
		} else {
			return "Seller not found";
		}

	}

	@Override
	public List<Seller> viewAllSellers() {

		return sellerRepository.findAll();
	}

	
	@Override
	public String generateResetToken(String email) {
	    Optional<Seller> sellerOpt = sellerRepository.findByEmail(email);
	    if (sellerOpt.isEmpty()) {
	        return "Seller not found!";
	    }

	    Seller seller = sellerOpt.get();
	    String resetToken = UUID.randomUUID().toString();
	    seller.setResetToken(resetToken);
	    sellerRepository.save(seller);

	    String resetLink = "http://localhost:5173/sreset-password?token=" + resetToken;

	    EmailDetails mail = new EmailDetails();
	    mail.setRecipient(email);
	    mail.setSubject("🔐 Reset Your Password -SAVEANDSERVE");

	    String htmlContent = "<h3>Hello from <span style='color:#2563EB;'>SAVEANDSERVE</span> 👋</h3>"
	        + "<p>We received a request to reset your password.</p>"
	        + "<p><a href=\"" + resetLink + "\" "
	        + "style='padding:10px 20px; background-color:#2563EB; color:white; text-decoration:none; border-radius:5px;'>"
	        + "Click here to reset your password</a></p>"
	        + "<p>If you didn’t request this, please ignore this email.</p>"
	        + "<br><p>Regards,<br><b>SAVE AND SERVE SUPPORT TEAM</b></p>";

	    mail.setMsgBody(htmlContent);
	    emailService.sendHtmlMail(mail);  // ✅ Use HTML method

	    return "Reset link sent to your email";
	}

	    @Override
	    public String resetPassword(String token, String newPassword) {
	        Seller seller = sellerRepository.findByResetToken(token);
	        if (seller == null) {
	            return "Invalid token!";
	        }

	        seller.setPassword(passwordEncoder.encode(newPassword));
	        seller.setResetToken(null);
	        sellerRepository.save(seller);
	        return "Password updated successfully!";
	    }
	

}
