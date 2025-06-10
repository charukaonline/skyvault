package com.skyvault.server.config;

import com.skyvault.server.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userId;
        
        // Add debug logging for CORS and auth issues
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (!"OPTIONS".equals(method)) {
                log.debug("No valid Authorization header for {} {}", method, requestURI);
            }
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        userId = jwtService.extractUserId(jwt);
        
        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtService.validateToken(jwt)) {
                String role = jwtService.extractRole(jwt);
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
                );
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId, null, authorities
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                log.debug("Authentication successful for user {} with role {} accessing {} {}", 
                    userId, role, method, requestURI);
            } else {
                log.debug("Invalid JWT token for {} {}", method, requestURI);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
