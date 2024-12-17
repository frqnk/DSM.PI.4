import 'package:flame/game.dart';
import 'package:flutter/widgets.dart';

import 'rogue_shooter_game.dart';

class RogueShooterWidget extends StatelessWidget {
  const RogueShooterWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: GameWidget(
        game: RogueShooterGame(),
      ),
    );
  }
}
