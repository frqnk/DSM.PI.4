import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> makePayment(String amount, String currency) async {
  try {
    final response = await http.post(
        Uri.parse('YOUR_SERVER_ENDPOINT'),
        body: jsonEncode({
          'amount': amount,
          'currency': currency,
        }));

    final paymentIntentData = jsonDecode(response.body);
    await Stripe.instance.initPaymentSheet(
      paymentSheetParameters: SetupPaymentSheetParameters(
        paymentIntentClientSecret: paymentIntentData['client_secret'],
        merchantDisplayName: 'Joguinhos',
        customerId: paymentIntentData['customer'],
      ),
    );
    await Stripe.instance.presentPaymentSheet();
    print('Payment successful');
  } catch (e) {
    print('Payment failed: $e');
  }
}