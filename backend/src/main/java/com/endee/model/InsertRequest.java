package com.endee.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InsertRequest {
    @NotBlank(message = "Text cannot be blank")
    private String text;
}
