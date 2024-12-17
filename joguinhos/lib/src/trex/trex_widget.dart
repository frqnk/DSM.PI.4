import 'package:flame/game.dart';
import 'package:flutter/material.dart' hide Image, Gradient;

import 'trex_game.dart';

class TRexWidget extends StatelessWidget {
  const TRexWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: const BoxDecoration(
        color: Color(0xFFf7f7f7),
      ),
      child: SafeArea(
        child: GameWidget(
          game: TRexGame(),
        ),
      ),
    );
  }
}
