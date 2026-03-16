package com.projectcaas.todo.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectcaas.todo.model.TodoItem;
import com.projectcaas.todo.repository.TodoItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/items")
public class TodoItemController {

    private final TodoItemRepository repository;
    private final ObjectMapper objectMapper;

    public TodoItemController(TodoItemRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public List<TodoItem> getItems() {
        return repository.findAll();
    }

    @PostMapping
    public TodoItem addItem(@RequestBody(required = false) String rawBody) {
        JsonNode body = safeReadBody(rawBody);
        TodoItem item = new TodoItem();
        item.setId(UUID.randomUUID().toString());
        item.setName(readName(body, ""));
        item.setCompleted(readCompleted(body, false));
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoItem> updateItem(@PathVariable String id,
                                               @RequestBody(required = false) String rawBody) {
        JsonNode body = safeReadBody(rawBody);
        TodoItem item = repository.findById(id)
                .orElseGet(() -> new TodoItem(id, "", false));

        if (body.has("name")) {
            item.setName(readName(body, item.getName()));
        }
        if (body.has("completed")) {
            item.setCompleted(readCompleted(body, item.isCompleted()));
        }

        return ResponseEntity.ok(repository.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        }
        return ResponseEntity.ok().build();
    }

    private JsonNode safeReadBody(String rawBody) {
        if (rawBody == null || rawBody.isBlank()) {
            return objectMapper.createObjectNode();
        }

        try {
            JsonNode parsed = objectMapper.readTree(rawBody);
            if (parsed == null || !parsed.isObject()) {
                return objectMapper.createObjectNode();
            }
            return parsed;
        } catch (Exception ignored) {
            return objectMapper.createObjectNode();
        }
    }

    private String readName(JsonNode body, String fallback) {
        JsonNode nameNode = body.get("name");
        if (nameNode == null || nameNode.isNull()) {
            return fallback;
        }
        return nameNode.isTextual() ? nameNode.asText() : nameNode.toString();
    }

    private boolean readCompleted(JsonNode body, boolean fallback) {
        JsonNode completedNode = body.get("completed");
        if (completedNode == null || completedNode.isNull()) {
            return fallback;
        }

        if (completedNode.isBoolean()) {
            return completedNode.asBoolean();
        }

        if (completedNode.isNumber()) {
            return completedNode.asInt() != 0;
        }

        if (completedNode.isTextual()) {
            String value = completedNode.asText().trim().toLowerCase();
            if ("true".equals(value) || "1".equals(value) || "yes".equals(value) || "sim".equals(value)) {
                return true;
            }
            if ("false".equals(value) || "0".equals(value) || "no".equals(value) || "nao".equals(value) || "não".equals(value)) {
                return false;
            }
        }

        return fallback;
    }
}
