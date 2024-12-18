import 'package:flutter/material.dart';

import 'settings_controller.dart';

class SettingsView extends StatelessWidget {
  const SettingsView({super.key, required this.controller});

  final SettingsController controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(8),
        child: DropdownButton<ThemeMode>(
          value: controller.themeMode,
          onChanged: controller.updateThemeMode,
          items: const [
            DropdownMenuItem(
              value: ThemeMode.system,
              child: Text('Tema do sistema'),
            ),
            DropdownMenuItem(
              value: ThemeMode.light,
              child: Text('Tema claro'),
            ),
            DropdownMenuItem(
              value: ThemeMode.dark,
              child: Text('Tema escuro'),
            )
          ],
        ),
      ),
    );
  }
}
