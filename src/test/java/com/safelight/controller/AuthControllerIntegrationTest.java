package com.safelight.controller;

import com.safelight.dto.LoginRequest;
import com.safelight.dto.SignupRequest;
import com.safelight.model.User;
import com.safelight.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    void signupShouldReturnCreatedForNewEmail() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setFname("Jane");
        request.setLname("Doe");
        request.setEmail("jane@example.com");
        request.setPassword("secret");
        request.setPhone("1234567890");
        request.setDob(LocalDate.of(1995, 3, 10));
        request.setCountry("USA");

        User savedUser = new User();
        savedUser.setId(101);
        savedUser.setFname("Jane");
        savedUser.setLname("Doe");
        savedUser.setEmail("jane@example.com");
        savedUser.setPassword("secret");
        savedUser.setPhone("1234567890");
        savedUser.setRole("USER");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fname":"Jane",
                                  "lname":"Doe",
                                  "email":"jane@example.com",
                                  "password":"secret",
                                  "phone":"1234567890",
                                  "dob":"1995-03-10",
                                  "country":"USA"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(101)))
                .andExpect(jsonPath("$.email", is("jane@example.com")))
                .andExpect(jsonPath("$.role", is("USER")));

        verify(userRepository).save(any(User.class));
    }

    @Test
    void signupShouldReturnConflictForExistingEmail() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("jane@example.com");
        request.setPassword("secret");

        User existingUser = new User();
        existingUser.setId(1);
        existingUser.setEmail("jane@example.com");
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existingUser));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"jane@example.com",
                                  "password":"secret"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(content().string("Email is already registered"));
    }

    @Test
    void loginShouldSetSessionAndReturnUserOnValidCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("correct");

        User user = new User();
        user.setId(7);
        user.setFname("John");
        user.setLname("Doe");
        user.setEmail("john@example.com");
        user.setPassword("correct");
        user.setPhone("9999999999");
        user.setRole("USER");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"john@example.com",
                                  "password":"correct"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(request().sessionAttribute("USER_ID", 7))
                .andExpect(jsonPath("$.id", is(7)))
                .andExpect(jsonPath("$.email", is("john@example.com")))
                .andExpect(jsonPath("$.role", is("USER")));
    }

    @Test
    void loginShouldReturnUnauthorizedForInvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("wrong");

        User user = new User();
        user.setId(7);
        user.setEmail("john@example.com");
        user.setPassword("correct");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email":"john@example.com",
                                  "password":"wrong"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid credentials"));
    }

    @Test
    void currentUserShouldReturnUnauthorizedWithoutSession() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Not logged in"));
    }

    @Test
    void currentUserShouldReturnUserWithValidSession() throws Exception {
        User user = new User();
        user.setId(11);
        user.setFname("Active");
        user.setLname("User");
        user.setEmail("active@example.com");
        user.setPhone("1231231234");
        user.setRole("USER");
        when(userRepository.findById(11)).thenReturn(Optional.of(user));

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_ID", 11);

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(11)))
                .andExpect(jsonPath("$.email", is("active@example.com")))
                .andExpect(jsonPath("$.role", is("USER")));
    }

    @Test
    void logoutShouldInvalidateSessionAndReturnNoContent() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("USER_ID", 11);

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());
    }
}
