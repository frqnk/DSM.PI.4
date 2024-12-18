import 'package:firebase_auth/firebase_auth.dart' hide EmailAuthProvider;
import 'package:firebase_ui_auth/firebase_ui_auth.dart';
import 'package:firebase_ui_oauth_google/firebase_ui_oauth_google.dart';
import 'package:flutter/material.dart';

const clientId =
    '431825791054-u5llbc65g8vfa56l6o5palj6vn6ug349.apps.googleusercontent.com';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.hasData) return const ProfileScreen();

        return SignInScreen(
          providers: [
            EmailAuthProvider(),
            GoogleProvider(clientId: clientId),
          ],
        );
      },
    );
  }
}
