import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/practical_info.dart';

class PracticalInfoService {
  final String baseUrl = 'http://10.0.2.2:5001/api'; // Pour l'émulateur Android
  // final String baseUrl = 'http://localhost:5001/api'; // Pour iOS
  final storage = const FlutterSecureStorage();

  Future<String?> getToken() async {
    return await storage.read(key: 'token');
  }

  // Get all practical info (for students)
  Future<List<PracticalInfo>> getPracticalInfo() async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.get(
      Uri.parse('$baseUrl/practical-info'),
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map<PracticalInfo>((item) => PracticalInfo.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load practical info');
    }
  }

  // Get practical info by category
  Future<List<PracticalInfo>> getPracticalInfoByCategory(String category) async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.get(
      Uri.parse('$baseUrl/practical-info/category/$category'),
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map<PracticalInfo>((item) => PracticalInfo.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load practical info by category');
    }
  }

  // Get single practical info
  Future<PracticalInfo> getPracticalInfoById(String id) async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.get(
      Uri.parse('$baseUrl/practical-info/$id'),
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    );

    if (response.statusCode == 200) {
      return PracticalInfo.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load practical info');
    }
  }

  // Get PDF file URL
  String getPdfUrl(String filePath) {
    // Base URL for static files, without the '/api' part
    final String staticContentBaseUrl = baseUrl.replaceAll('/api', '');

    // Ensure no double slashes if filePath accidentally starts with one
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    return '$staticContentBaseUrl/$filePath';
  }

  // Admin functions (if needed for future admin panel)
  Future<List<PracticalInfo>> getAllPracticalInfo() async {
    final token = await getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.get(
      Uri.parse('$baseUrl/practical-info/admin/all'),
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map<PracticalInfo>((item) => PracticalInfo.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load all practical info');
    }
  }
} 