package com.klef.fsd.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.klef.fsd.model.Admin;
import com.klef.fsd.model.Buyer;
import com.klef.fsd.model.Seller;
import com.klef.fsd.service.AdminService;
import com.klef.fsd.service.AdminServiceImpl;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")

public class AdminController {

	@Autowired
	private AdminServiceImpl service;

	@PostMapping("/checkadminlogin")
	public ResponseEntity<?> checkadminlogin(@RequestBody Admin admin) {
		try {
			Admin a = service.checkadminlogin(admin.getUsername(), admin.getPassword());

			if (a != null) {
				// Generate JWT token
				Map<String, Object> response = service.generateAdminToken(a);
				return ResponseEntity.ok(response); // if login is successful
			} else {
				return ResponseEntity.status(401).body("Invalid Username or Password"); // if login is fail
			}
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
		}
	}

	@PostMapping("/addseller")
	public ResponseEntity<String> addseller(@RequestBody Seller seller) {
		try {
			String output = service.addSeller(seller);
			return ResponseEntity.ok(output); // 200 - success
		} catch (Exception e) {

			return ResponseEntity.status(500).body("Failed to Add Seller ... !!");
		}
	}

	@GetMapping("/viewallsellers")
	public ResponseEntity<List<Seller>> viewallsellers() {
		List<Seller> sellers = service.viewSellers();

		return ResponseEntity.ok(sellers); // 200 - success
	}

	@GetMapping("/viewallbuyers")
	public ResponseEntity<List<Buyer>> viewallbuyers() {
		List<Buyer> buyers = service.viewBuyers();

		return ResponseEntity.ok(buyers); // 200 - success
	}
	@PostMapping("/approveseller")
	public ResponseEntity<String> approveSeller(@RequestBody int sellerId) {
	    try {
	        String result = service.approveSeller(sellerId);
	        return ResponseEntity.ok(result);
	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("Approval Failed: " + e.getMessage());
	    }
	}


}
