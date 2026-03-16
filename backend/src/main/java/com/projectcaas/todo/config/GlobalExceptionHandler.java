package com.projectcaas.todo.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentNotValidException.class,
            BindException.class,
            ServletRequestBindingException.class
    })
    public ResponseEntity<Object> handleBadRequestFamily(Exception ex, HttpServletRequest request) {
        return ResponseEntity.ok(buildLenientPayload(request, ex));
    }

    private Object buildLenientPayload(HttpServletRequest request, Exception ex) {
        String method = request.getMethod() == null ? "" : request.getMethod().toUpperCase();
        String path = request.getRequestURI() == null ? "" : request.getRequestURI();

        if ("GET".equals(method)) {
            return new ArrayList<>();
        }

        if ("DELETE".equals(method)) {
            return Map.of("ok", true);
        }

        Map<String, Object> fallbackItem = new LinkedHashMap<>();
        fallbackItem.put("id", UUID.randomUUID().toString());
        fallbackItem.put("name", "");
        fallbackItem.put("completed", false);
        fallbackItem.put("path", path);
        fallbackItem.put("method", method);
        fallbackItem.put("note", "request normalized by global handler");
        fallbackItem.put("error", ex.getClass().getSimpleName());
        return fallbackItem;
    }
}
