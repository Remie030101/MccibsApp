import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/login_screen.dart';
import 'screens/student_card_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/splash_screen.dart';
import 'services/api_service.dart';
import 'services/notification_service.dart';
import 'models/student.dart';
import 'package:badges/badges.dart' as badges;
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await NotificationService().initialize();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MCCIBS Student Card',
      theme: ThemeData(
        primaryColor: const Color(0xFF1E88E5), // Material Blue
        colorScheme: ColorScheme.light(
          primary: const Color(0xFF1E88E5),
          secondary: const Color(0xFF64B5F6),
          surface: Colors.white,
          background: Colors.white,
        ),
        scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E88E5),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        fontFamily: 'Poppins',
        useMaterial3: true,
      ),
      home: const SplashScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/notifications': (context) => const NotificationsScreen(),
      },
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _apiService = ApiService();
  Student? _student;
  bool _isLoading = true;
  int _selectedIndex = 0;
  int _unreadCount = 0;
  List<String> _readNotificationIds = [];

  @override
  void initState() {
    super.initState();
    _loadStudentProfile();
    _loadReadNotifications();
    _loadUnreadCount();
  }

  Future<void> _loadStudentProfile() async {
    try {
      final student = await _apiService.getStudentProfile();
      setState(() {
        _student = student;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  Future<void> _loadReadNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _readNotificationIds = prefs.getStringList('readNotificationIds') ?? [];
    });
  }

  Future<void> _saveReadNotifications(List<String> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('readNotificationIds', ids);
  }

  Future<void> _loadUnreadCount() async {
    final notificationsData = await _apiService.getNotifications();
    final prefs = await SharedPreferences.getInstance();
    final readIds = prefs.getStringList('readNotificationIds') ?? [];
    final allIds = notificationsData.map((n) => n['_id'] as String).toList();
    final unread = allIds.where((id) => !readIds.contains(id)).length;
    setState(() {
      _unreadCount = unread;
    });
  }

  void _onItemTapped(int index) async {
    if (index == 1) {
      // Marquer toutes les notifications comme lues
      final notificationsData = await _apiService.getNotifications();
      final allIds = notificationsData.map((n) => n['_id'] as String).toList();
      await _saveReadNotifications(allIds);
      setState(() {
        _unreadCount = 0;
        _selectedIndex = index;
      });
    } else {
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_student == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load student profile'),
              ElevatedButton(
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/login');
                },
                child: const Text('Back to Login'),
              ),
            ],
          ),
        ),
      );
    }

    final List<Widget> _pages = [
      StudentCardScreen(student: _student!),
      NotificationsScreen(),
    ];

    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.card_membership),
            label: 'Card',
          ),
          BottomNavigationBarItem(
            icon: badges.Badge(
              showBadge: _unreadCount > 0,
              badgeContent: Text(
                _unreadCount.toString(),
                style: const TextStyle(color: Colors.white, fontSize: 10),
              ),
              child: const Icon(Icons.notifications),
            ),
            label: 'Notifications',
          ),
        ],
        onTap: _onItemTapped,
      ),
    );
  }
}
