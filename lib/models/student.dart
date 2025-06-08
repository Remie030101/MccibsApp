class Student {
  final String id;
  final String firstName;
  final String lastName;
  final String studentId;
  final String email;
  final String class_;
  final bool isActive;
  final String? photo;

  Student({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.studentId,
    required this.email,
    required this.class_,
    this.isActive = true,
    this.photo,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['_id'] ?? json['id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      studentId: json['studentId'] ?? '',
      email: json['email'] ?? '',
      class_: json['class'] ?? '',
      isActive: json['isActive'] ?? true,
      photo: json['photo'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'studentId': studentId,
      'email': email,
      'class': class_,
      'isActive': isActive,
      'photo': photo,
    };
  }

  String get fullName => '$firstName $lastName';
} 