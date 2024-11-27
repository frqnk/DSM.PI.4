import 'package:flutter/material.dart';

import 'brick_breaker/widgets/game_app.dart' as brick_breaker;
import 'padracing/padracing_widget.dart';
import 'rogue_shooter/rogue_shooter_widget.dart';
import 'trex/trex_widget.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Joguinhos',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: View.of(context).platformDispatcher.platformBrightness,
        ),
      ),
      home: const GameMenu(),
    );
  }
}

class GameMenu extends StatelessWidget {
  const GameMenu({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Center(
          child: Text('Joguinhos'),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(10),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const brick_breaker.GameApp()),
                  );
                },
                child: const Text('Brick Breaker'),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const PadracingWidget()),
                  );
                },
                child: const Text('Pad Racing'),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const RogueShooterWidget()),
                  );
                },
                child: const Text('Rogue Shooter'),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const TRexWidget()),
                  );
                },
                child: const Text('T-Rex Game'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}