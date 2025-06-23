import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/event.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class EventService {
  final String baseUrl = 'http://10.0.2.2:5001/api/events'; // For Android emulator
  // final String baseUrl = 'http://localhost:5001/api/events'; // For iOS
  final storage = const FlutterSecureStorage();

  Future<String?> getToken() async {
    return await storage.read(key: 'token');
  }

  Future<List<Event>> getUpcomingEvents() async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.get(
      Uri.parse(baseUrl),
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map<Event>((item) => Event.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load upcoming events');
    }
  }
} 