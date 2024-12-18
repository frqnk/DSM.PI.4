import 'package:flutter/material.dart' hide Image, Gradient;

import 'menu_card.dart';
import 'padracing_game.dart';

class Menu extends StatelessWidget {
  const Menu(this.game, {super.key});

  final PadRacingGame game;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Material(
      color: Colors.transparent,
      child: Center(
        child: Wrap(
          children: [
            Column(
              children: [
                MenuCard(
                  children: [
                    Text(
                      'Jogo de corrida',
                      style: textTheme.displayLarge,
                    ),
                    Text(
                      'O primeiro a dar 3 voltas vence!',
                      style: textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      child: const Text('Um jogador'),
                      onPressed: () {
                        game.prepareStart(numberOfPlayers: 1);
                      },
                    ),
                    Text(
                      'Teclas de seta',
                      style: textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      child: const Text('Dois jogadores'),
                      onPressed: () {
                        game.prepareStart(numberOfPlayers: 2);
                      },
                    ),
                    Text(
                      'Teclas WASD e teclas de seta',
                      style: textTheme.bodyMedium,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
