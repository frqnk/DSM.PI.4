import 'package:flame/game.dart';
import 'package:flutter/material.dart';

import 'brick_breaker_game.dart';
import 'config.dart';
import 'components/overlay_screen.dart';
import 'components/score_card.dart';

class BrickBreakerWidget extends StatefulWidget {
  const BrickBreakerWidget({super.key});

  @override
  State<BrickBreakerWidget> createState() => _BrickBreakerWidgetState();
}

class _BrickBreakerWidgetState extends State<BrickBreakerWidget> {
  late final BrickBreakerGame game;

  @override
  void initState() {
    super.initState();
    game = BrickBreakerGame();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xffa9d6e5),
            Color(0xfff2e8cf),
          ],
        ),
      ),
      child: SafeArea(
        child: Center(
          child: Column(
            children: [
              ScoreCard(score: game.score),
              Expanded(
                child: FittedBox(
                  child: SizedBox(
                    width: gameWidth,
                    height: gameHeight,
                    child: GameWidget(
                      game: game,
                      overlayBuilderMap: {
                        PlayState.welcome.name: (context, game) =>
                            const OverlayScreen(
                              title: 'Toque para começar',
                              subtitle:
                                  'Use as teclas de seta ou deslize para mover',
                            ),
                        PlayState.gameOver.name: (context, game) =>
                            const OverlayScreen(
                              title: 'Fim de jogo',
                              subtitle: 'Toque para jogar novamente',
                            ),
                        PlayState.won.name: (context, game) =>
                            const OverlayScreen(
                              title: 'Você venceu!',
                              subtitle: 'Toque para jogar novamente',
                            ),
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
