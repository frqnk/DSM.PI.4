import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';

import 'firebase_options.dart';
import 'firebase_ui.dart';
import 'src/brick_breaker/brick_breaker_widget.dart';
import 'src/padracing/padracing_widget.dart';
import 'src/rogue_shooter/rogue_shooter_widget.dart';
import 'src/settings/settings_controller.dart';
import 'src/settings/settings_service.dart';
import 'src/settings/settings_view.dart';
import 'src/trex/trex_widget.dart';

final settingsController = SettingsController(SettingsService());

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await settingsController.loadSettings();
  runApp(JoguinhosApp(settingsController: settingsController));
}

class JoguinhosApp extends StatelessWidget {
  const JoguinhosApp({
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
          home: const Home(),
        );
      },
    );
  }
}

class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  int _homeIndex = 0;

  static const _pages = [
    {
      'label': Text('Jogos'),
      'icon': Icon(Icons.games_rounded),
      'widget': Jogos(),
    },
    {
      'label': Text('Placares'),
      'icon': Icon(Icons.leaderboard),
      'widget': Placares(),
    },
    {
      'label': Text('Perfil'),
      'icon': Icon(Icons.person),
      'widget': Perfil(),
    },
    {
      'label': Text('Ajustes'),
      'icon': Icon(Icons.settings),
      'widget': Ajustes(),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Joguinhos'),
      ),
      body: SafeArea(
        child: Row(
          children: [
            NavigationRail(
              extended: false,
              labelType: NavigationRailLabelType.all,
              destinations: [
                ..._pages.map(
                  (page) => NavigationRailDestination(
                    label: page['label'] as Widget,
                    icon: page['icon'] as Widget,
                  ),
                ),
              ],
              selectedIndex: _homeIndex,
              onDestinationSelected: (int index) {
                setState(() {
                  _homeIndex = index;
                });
              },
            ),
            Expanded(
              child: IndexedStack(
                index: _homeIndex,
                children: [
                  ..._pages.map((page) => page['widget'] as Widget),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class Jogos extends StatefulWidget {
  const Jogos({super.key});

  @override
  State<Jogos> createState() => _JogosState();
}

class _JogosState extends State<Jogos> {
  final _jogos = [
    {
      'label': Text('Quebra-laje'),
      'thumbnail': Image.asset('assets/images/thumbnails/brick_breaker.png'),
      'widget': BrickBreakerWidget(),
    },
    {
      'label': Text('Jogo de corrida'),
      'thumbnail': Image.asset('assets/images/thumbnails/padracing.png'),
      'widget': PadracingWidget(),
    },
    {
      'label': Text('Atirador estilo rogue'),
      'thumbnail': Image.asset('assets/images/thumbnails/rogue_shooter.png'),
      'widget': RogueShooterWidget(),
    },
    {
      'label': Text('Jogo do tiranossauro'),
      'thumbnail': Image.asset('assets/images/thumbnails/trex.png'),
      'widget': TRexWidget(),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Center(
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ..._jogos.map(
              (jogo) => SizedBox(
                width: 300,
                child: Card(
                  child: InkWell(
                    onTap: () {
                      Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => jogo['widget'] as Widget));
                    },
                    child: Column(children: [
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: AspectRatio(
                            aspectRatio: 5 / 4,
                            child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: jogo['thumbnail'] as Widget)),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
                        child: jogo['label'] as Widget,
                      ),
                    ]),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class Placares extends StatelessWidget {
  const Placares({super.key});

  @override
  Widget build(BuildContext context) {
    return const Placeholder(
      strokeWidth: 1,
    );
  }
}

class Perfil extends StatelessWidget {
  const Perfil({super.key});

  @override
  Widget build(BuildContext context) {
    return const AuthGate();
  }
}

class Ajustes extends StatelessWidget {
  const Ajustes({super.key});

  @override
  Widget build(BuildContext context) {
    return SettingsView(
      controller: settingsController,
    );
  }
}
