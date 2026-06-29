package com.fatec.labify.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    private String theme = "light";
    private boolean sidebarCollapsed = false;
}
