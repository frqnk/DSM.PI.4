import 'package:flutter/material.dart';

import 'src/settings/settings_controller.dart';
import 'src/settings/settings_service.dart';
import 'src/settings/settings_view.dart';
import 'src/brick_breaker/brick_breaker_widget.dart';
import 'src/padracing/padracing_widget.dart';
import 'src/rogue_shooter/rogue_shooter_widget.dart';
import 'src/trex/trex_widget.dart';

import 'package:firebase_core/firebase_core.dart';

import 'firebase_options.dart';
import 'src/home_widget.dart';
import 'src/auth/firebase_ui.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  final settingsController = SettingsController(SettingsService());
  await settingsController.loadSettings();
  runApp(Joguinhos(settingsController: settingsController));
}

class Joguinhos extends StatelessWidget {
  const Joguinhos({
    super.key,
    required this.settingsController,
  });

  final SettingsController settingsController;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: settingsController,
      builder: (BuildContext context, Widget? child) {
        return MaterialApp(
          title: 'Joguinhos',
          restorationScopeId: 'app',
          theme: ThemeData(),
          darkTheme: ThemeData.dark(),
          themeMode: settingsController.themeMode,
          onGenerateRoute: (RouteSettings routeSettings) {
            return MaterialPageRoute<void>(
              settings: routeSettings,
              builder: (BuildContext context) {
                switch (routeSettings.name) {
                  case SettingsView.routeName:
                    return SettingsView(controller: settingsController);
                  case LoginScreen.routeName:
                    return LoginScreen();
                  default:
                    return Home();
                }
              },
            );
          },
        );
      },
    );
  }
}
