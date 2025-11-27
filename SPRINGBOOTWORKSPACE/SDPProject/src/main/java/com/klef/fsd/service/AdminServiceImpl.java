package com.klef.fsd.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.klef.fsd.model.Admin;
import com.klef.fsd.model.Buyer;
import com.klef.fsd.model.Seller;
import com.klef.fsd.repository.AdminRepository;
import com.klef.fsd.repository.BuyerRepository;
import com.klef.fsd.repository.SellerRepository;
import com.klef.fsd.util.JwtUtil;

@Service
public class AdminServiceImpl implements AdminService {

	@Autowired
	private AdminRepository adminRepository;
	
	@Autowired
	private SellerRepository sellerRepository;
	
	@Autowired
	private BuyerRepository buyerRepository;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public Admin checkadminlogin(String username, String password) {
		try {
			Admin admin = adminRepository.findByUsername(username);
			if (admin != null) {
				// Check if password matches (handles both encrypted and plain text passwords)
				if (passwordEncoder.matches(password, admin.getPassword()) || 
					password.equals(admin.getPassword())) {
					// If it's a plain text password, encrypt it for future use
					if (password.equals(admin.getPassword())) {
						admin.setPassword(passwordEncoder.encode(password));
						adminRepository.save(admin);
					}
					return admin;
				}
			}
		} catch (Exception e) {
			System.err.println("Error in admin login: " + e.getMessage());
		}
		return null;
	}
	
	public Map<String, Object> generateAdminToken(Admin admin) {
		String token = jwtUtil.generateToken(admin.getUsername(), "ADMIN", null);
		Map<String, Object> response = new HashMap<>();
		response.put("token", token);
		response.put("admin", admin);
		response.put("role", "ADMIN");
		return response;
	}

	@Override
	public String addSeller(Seller seller) {
		
		sellerRepository.save(seller);
		return  "Seller Added Succesfully";
	}

	@Override
	public List<Seller> viewSellers() {

		return sellerRepository.findAll();
	}

	@Override
	public List<Buyer> viewBuyers() {

		return buyerRepository.findAll();
	}

	@Override
	public String deleteSeller(int id) {
		Optional<Seller> seller = sellerRepository.findById(id);
		if (seller.isPresent()) {
			sellerRepository.deleteById(id);
			return "Seller Deleted Succesfully";
		}
		else {
			return "Seller Id not Found";
		}
	}

	@Override
	public String deleteBuyer(int id) {
		Optional<Buyer> buyer = buyerRepository.findById(id);
		if (buyer.isPresent()) {
			buyerRepository.deleteById(id);
			return "Buyer Deleted Succesfully";
		}
		else {
			return "Buyer Id not Found";
		}
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
	        return "Seller Approved Successfully";
	    } else {
	        return "Seller Not Found";
	    }
	}

}
