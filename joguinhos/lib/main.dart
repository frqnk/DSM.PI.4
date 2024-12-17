import 'package:flutter/material.dart';

import 'home.dart';

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
