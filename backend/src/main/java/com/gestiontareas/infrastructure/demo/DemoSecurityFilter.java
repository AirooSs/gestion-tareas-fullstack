package com.gestiontareas.infrastructure.demo;

import com.gestiontareas.application.demo.DemoService;
import com.gestiontareas.domain.port.out.DemoRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class DemoSecurityFilter extends OncePerRequestFilter {
    private final DemoRepository repository;
    private final int normalLimit, createLimit;
    private final Map<String, Window> windows = new LinkedHashMap<>();
    private record Window(long minute, int count) {}
    public DemoSecurityFilter(DemoRepository repository, int normalLimit, int createLimit) {
        if (normalLimit < 1 || createLimit < 1) throw new IllegalArgumentException("Rate limits must be positive");
        this.repository=repository; this.normalLimit=normalLimit; this.createLimit=createLimit;
    }
    private synchronized boolean allowed(String key, int limit) {
        long minute=System.currentTimeMillis()/60000;
        windows.entrySet().removeIf(entry -> entry.getValue().minute() < minute - 1);
        Window current=windows.get(key);
        if (current == null || current.minute() != minute) {
            if (windows.size() >= 10000 && !windows.containsKey(key)) return false;
            windows.put(key,new Window(minute,1)); return true;
        }
        if (current.count() >= limit) return false;
        windows.put(key,new Window(minute,current.count()+1)); return true;
    }
    private static final class LimitedRequest extends HttpServletRequestWrapper {
        private ServletInputStream input;
        LimitedRequest(HttpServletRequest request) { super(request); }
        @Override public ServletInputStream getInputStream() throws IOException {
            if (input == null) {
                ServletInputStream delegate = super.getInputStream();
                input = new ServletInputStream() {
                    private int count;
                    @Override public int read() throws IOException {
                        int value = delegate.read();
                        if (value != -1 && ++count > 8192) throw new IOException("Request body too large");
                        return value;
                    }
                    @Override public boolean isFinished() { return delegate.isFinished(); }
                    @Override public boolean isReady() { return delegate.isReady(); }
                    @Override public void setReadListener(ReadListener listener) { delegate.setReadListener(listener); }
                };
            }
            return input;
        }
        @Override public BufferedReader getReader() throws IOException { return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8)); }
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        if (!request.getRequestURI().startsWith("/api/") || "OPTIONS".equals(request.getMethod())) { chain.doFilter(request,response); return; }
        if (request.getContentLengthLong() > 8192) { response.setStatus(413); return; }
        boolean creating="POST".equals(request.getMethod()) && "/api/demo/session".equals(request.getRequestURI());
        String ip=request.getRemoteAddr();
        if (!allowed("all:"+ip, normalLimit) || (creating && !allowed("new:"+ip, createLimit))) {
            response.setStatus(429); response.setHeader("Retry-After","60"); return;
        }
        String auth=request.getHeader("Authorization");
        if (auth != null && auth.matches("Bearer [A-Za-z0-9_-]{43}")) {
            UUID id=repository.authenticate(DemoService.hash(auth.substring(7))).orElse(null);
            if (id != null) {
                if (!allowed("session:"+id, normalLimit)) { response.setStatus(429); response.setHeader("Retry-After","60"); return; }
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(id, null, java.util.List.of()));
            }
        }
        chain.doFilter(new LimitedRequest(request),response);
    }
}
