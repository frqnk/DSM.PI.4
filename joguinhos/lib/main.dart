import 'package:flutter/material.dart';

import 'brick_breaker/widgets/game_app.dart' as brick_breaker;
import 'padracing/padracing_widget.dart';
import 'rogue_shooter/rogue_shooter_widget.dart';
import 'trex/trex_widget.dart';

void main() {
  runApp(const Joguinhos());
}

class Joguinhos extends StatelessWidget {
  const Joguinhos({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Joguinhos',
      home: Home(),
    );
  }
}

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Joguinhos'),
        actions: [
            IconButton(
              icon: const Icon(Icons.person),
              tooltip: 'Perfil',
              onPressed: () {},
            ),
          ],
        ),
      body: Center(
        child: Wrap(
          children: <Widget>[
            ...[
              {'title': 'Brick Breaker', 'widget': const brick_breaker.GameApp()},
              {'title': 'Pad Racing', 'widget': const PadracingWidget()},
              {'title': 'Rogue Shooter', 'widget': const RogueShooterWidget()},
              {'title': 'T-Rex Game', 'widget': const TRexWidget()},
            ].map((game) => Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                child: Text(game['title'] as String),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => game['widget'] as Widget),
                  );
                },
              ),
            )),
          ],
        ),
      ),
    );
  }
}