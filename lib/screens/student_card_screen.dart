import 'package:flutter/material.dart';
import '../models/student.dart';
import '../main.dart';

class StudentCardScreen extends StatelessWidget {
  final Student student;

  const StudentCardScreen({super.key, required this.student});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Carte Étudiant'),
        backgroundColor: kAppHeaderBlue,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Container(
        color: Colors.grey.shade100,
        child: Center(
          child: Card(
            elevation: 10,
            shadowColor: Colors.blue.withOpacity(0.3),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            child: Container(
              width: 370,
              height: 230,
              padding: const EdgeInsets.fromLTRB(15, 10, 18, 18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white,
                    Colors.white,
                    Colors.blue.shade300,
                    Colors.blue.shade600,
                  ],
                  stops: const [0.0, 0.75, 0.85, 1.0],
                ),
                borderRadius: BorderRadius.circular(20),
                image: DecorationImage(
                  image: const AssetImage('assets/images/pattern.png'),
                  repeat: ImageRepeat.repeat,
                  opacity: 0.25,
                  colorFilter: ColorFilter.mode(
                    Colors.blue.shade600.withOpacity(0.4),
                    BlendMode.srcOver,
                  ),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Photo/avatar
                  Container(
                    width: 120,
                    height: 140,
                    margin: const EdgeInsets.only(right: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade300, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.2),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: student.photo != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              'http://10.0.2.2:5001/api/students/${student.id}/photo',
                              width: double.infinity,
                              height: double.infinity,
                              fit: BoxFit.cover,
                              loadingBuilder: (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return Center(
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                        : null,
                                    color: Colors.blue,
                                  ),
                                );
                              },
                              errorBuilder: (context, error, stackTrace) {
                                return const Center(
                                  child: Icon(Icons.person, size: 50, color: Colors.blue),
                                );
                              },
                            ),
                          )
                        : const Center(
                            child: Icon(Icons.person, size: 50, color: Colors.blue),
                          ),
                  ),
                  // Infos à droite
                  Expanded(
                    child: Stack(
                      children: [
                        // Logo in top right
                        Positioned(
                          top: -30,
                          right: -19,
                          child: Image.asset(
                            'assets/images/mccibs_logo.png',
                            height: 100,
                            width: 100,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(Icons.school, color: Colors.blue, size: 100);
                            },
                          ),
                        ),
                        // Centered text column next to photo
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Student name above class
                              Text(
                                student.fullName,
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              // Class
                              Text(
                                student.class_,
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              Text(
                                student.studentId,
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              Text(
                                'SEPT 24 - JUN 26',
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              const SizedBox(height: 10),
                              // Email row
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.email, color: Colors.black, size: 10),
                                  const SizedBox(width: 4),
                                  Flexible(
                                    child: Text(
                                      student.email,
                                      style: const TextStyle(
                                        color: Colors.black,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 10,
                                        letterSpacing: 1.5,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
} 