package com.sms.backend.controller;

import com.sms.backend.entity.User;

import com.sms.backend.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController( UserService userService) {
        this.userService = userService;
    }

    // admin only
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // get current logged in user
    @GetMapping("/me")
    public User getCurrentuser(Authentication authentication){
        return userService.getUserByUsername(authentication.getName());
    }
}
