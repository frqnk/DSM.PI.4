import 'package:flutter/material.dart';
import 'package:joguinhos/src/auth/firebase_ui.dart';

import 'brick_breaker/brick_breaker_widget.dart';
import 'padracing/padracing_widget.dart';
import 'rogue_shooter/rogue_shooter_widget.dart';
import 'trex/trex_widget.dart';
import 'settings/settings_view.dart';

class Home extends StatelessWidget {
  const Home({super.key});

  static const routeName = '/';

  static const games = [
    {'title': 'Quebra-laje', 'widget': BrickBreakerWidget()},
    {'title': 'Jogo de corrida', 'widget': PadracingWidget()},
    {'title': 'Atirador estilo rogue', 'widget': RogueShooterWidget()},
    {'title': 'Jogo do tiranossauro rex', 'widget': TRexWidget()},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Joguinhos'),
      ),
      body: Row(
        children: [
          SafeArea(
            child: NavigationRail(
              extended: true,
              destinations: [
                NavigationRailDestination(
                    icon: Icon(Icons.games_rounded), label: Text('Jogos')),
                NavigationRailDestination(
                    icon: Icon(Icons.person), label: Text('Perfil')),
                NavigationRailDestination(
                    icon: Icon(Icons.settings), label: Text('Ajustes')),
              ],
              selectedIndex: 0,
              onDestinationSelected: (int index) {
                switch (index) {
                  case 0:
                    Navigator.pushReplacementNamed(context, Home.routeName);
                    break;
                  case 1:
                    Navigator.restorablePushNamed(
                        context, LoginScreen.routeName);
                    break;
                  case 2:
                    Navigator.restorablePushNamed(
                        context, SettingsView.routeName);
                    break;
                }
              },
            ),
          ),
          Wrap(
            alignment: WrapAlignment.center,
            children: List.generate(
              games.length,
              (index) => ElevatedButton(
                child: Text(games[index]['title'] as String),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          games[index]['widget'] as Widget,
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
