import 'package:flutter/material.dart';

import 'brick_breaker/brick_breaker_widget.dart';
import 'padracing/padracing_widget.dart';
import 'rogue_shooter/rogue_shooter_widget.dart';
import 'trex/trex_widget.dart';

class Home extends StatelessWidget {
  const Home({super.key});

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
      body: SafeArea(
        child: ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: games.length,
            itemBuilder: (BuildContext context, int index) {
              return ElevatedButton(
                child: Text(games[index]['title'] as String),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => games[index]['widget'] as Widget),
                  );
                },
              );
            }),
      ),
    );
  }
}
