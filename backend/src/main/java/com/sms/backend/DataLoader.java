package com.sms.backend;

import com.sms.backend.entity.Role;
import com.sms.backend.entity.Student;
import com.sms.backend.entity.User;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository,
                                StudentRepository studentRepository,
                                PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("student1").isEmpty()) {
                User studentUser = new User();
                studentUser.setUsername("student1");
                studentUser.setPassword(passwordEncoder.encode("1234"));
                studentUser.setEmail("student@uta.edu");
                studentUser.setName("Alex Johnson");
                studentUser.setRole(Role.STUDENT);
                userRepository.save(studentUser);

                Student student = new Student();
                student.setMajor("Information Systems");
                student.setCreditHours(0);
                student.setUser(studentUser);
                studentRepository.save(student);
            }
        };
    }
}