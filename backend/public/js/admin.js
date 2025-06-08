// API endpoint
const API_URL = '/api';

// Variable globale pour l'ID de l'étudiant en cours d'édition
let currentStudentId = null;

// Load students
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/students`, {
            headers: {
                'x-auth-token': localStorage.getItem('adminToken')
            }
        });
        if (!response.ok) {
            throw new Error('Failed to load students');
        }

        const students = await response.json();
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = '';

        // Get selected class filter
        const classFilter = document.getElementById('classFilter').value;

        // Filter students if a class is selected
        const filteredStudents = classFilter 
            ? students.filter(student => student.class === classFilter)
            : students;

        filteredStudents.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${student.photo ? `/api/students/${student._id}/photo` : 'images/default-avatar.png'}" 
                         alt="Photo de ${student.firstName} ${student.lastName}"
                         class="rounded-circle"
                         style="width: 40px; height: 40px; object-fit: cover;">
                </td>
                <td>${student.studentId}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.class}</td>
                <td>
                    <button class="btn btn-sm btn-info me-2" onclick="editStudent('${student._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading students:', error);
        if (error.message === 'Unauthorized') {
            window.location.href = '/login.html';
        }
    }
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch(`${API_URL}/notifications`, {
            headers: {
                'x-auth-token': localStorage.getItem('adminToken')
            }
        });
        if (!response.ok) {
            throw new Error('Failed to load notifications');
        }

        const notifications = await response.json();
        const tbody = document.getElementById('notificationsTableBody');
        tbody.innerHTML = '';

        notifications.forEach(notification => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${notification.title}</td>
                <td>${notification.message}</td>
                <td>${notification.type}</td>
                <td>${new Date(notification.createdAt).toLocaleString()}</td>
                <td>
                    <span class="badge ${notification.isActive ? 'bg-success' : 'bg-secondary'}">
                        ${notification.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    ${notification.imageUrl ? 
                        `<img src="${notification.imageUrl}" alt="Notification image" class="img-thumbnail" style="max-width: 100px; max-height: 100px;">` 
                        : '<span class="text-muted">Aucune image</span>'}
                </td>
                <td>
                    <button class="btn btn-sm btn-info me-2" onclick="editNotification('${notification._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
        if (error.message === 'Unauthorized') {
            window.location.href = '/login.html';
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const [studentsRes, notificationsRes] = await Promise.all([
            fetch(`${API_URL}/students`, {
                headers: {
                    'x-auth-token': localStorage.getItem('adminToken')
                }
            }),
            fetch(`${API_URL}/notifications`, {
                headers: {
                    'x-auth-token': localStorage.getItem('adminToken')
                }
            })
        ]);

        if (!studentsRes.ok || !notificationsRes.ok) {
            throw new Error('Failed to load dashboard data');
        }

        const students = await studentsRes.json();
        const notifications = await notificationsRes.json();

        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('activeNotifications').textContent = 
            notifications.filter(n => n.isActive).length;
        document.getElementById('connectedDevices').textContent = 
            students.filter(s => s.deviceToken).length;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        if (error.message === 'Unauthorized') {
            window.location.href = '/login.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Set admin name
    const adminName = localStorage.getItem('adminName');
    if (adminName) {
        document.getElementById('adminName').textContent = adminName;
    }

    // Add token to all fetch requests
    const originalFetch = window.fetch;
    window.fetch = function() {
        let [resource, config] = arguments;
        if (config === undefined) {
            config = {};
        }
        if (config.headers === undefined) {
            config.headers = {};
        }
        config.headers['x-auth-token'] = token;
        return originalFetch(resource, config);
    };

    // Sidebar toggle
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Navigation
    const navLinks = document.querySelectorAll('#sidebar a[data-page]');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');

            // Update active states
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');

            // Show target page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });
        });
    });

    // Add student
    const saveStudentBtn = document.getElementById('saveStudentBtn');
    if (saveStudentBtn) {
        saveStudentBtn.addEventListener('click', async function() {
            const form = document.getElementById('studentForm');
            const formData = new FormData();
            
            // Récupérer les valeurs des champs
            const studentId = document.getElementById('studentIdInput').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const studentClass = document.getElementById('class').value;
            const password = document.getElementById('password').value;
            const photoFile = document.getElementById('studentPhoto').files[0];
            
            // Validation des champs
            if (!studentId || !firstName || !lastName || !email || !studentClass) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }

            // Préparer les données de l'étudiant
            const studentData = {
                studentId,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                email,
                class: studentClass
            };

            // Ajouter le mot de passe seulement s'il est fourni
            if (password) {
                studentData.password = password;
            }

            try {
                // Si c'est une modification
                const existingStudentId = document.getElementById('studentId').value;
                let response;
                const token = localStorage.getItem('adminToken');
                
                if (!token) {
                    throw new Error('Non authentifié. Veuillez vous reconnecter.');
                }
                
                if (existingStudentId) {
                    // Mise à jour
                    response = await fetch(`${API_URL}/students/${existingStudentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify(studentData)
                    });
                } else {
                    // Création
                    console.log('Création d\'un nouvel étudiant avec les données:', studentData);
                    response = await fetch(`${API_URL}/students`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                            'x-auth-token': token
                    },
                    body: JSON.stringify(studentData)
                });
                }

                const data = await response.json();
                console.log('Réponse du serveur:', data);

                if (response.ok) {
                    // Si une photo a été sélectionnée, l'uploader
                    if (photoFile) {
                        const photoFormData = new FormData();
                        photoFormData.append('photo', photoFile);
                        
                        // Utiliser l'ID existant ou le nouvel ID de l'étudiant
                        const studentIdForPhoto = existingStudentId || data._id;
                        
                        if (!studentIdForPhoto) {
                            console.error('Données reçues du serveur:', data);
                            throw new Error('ID de l\'étudiant non trouvé');
                        }

                        console.log('Upload de la photo pour l\'étudiant:', studentIdForPhoto);
                        
                        const photoResponse = await fetch(`${API_URL}/students/${studentIdForPhoto}/photo`, {
                            method: 'POST',
                            headers: {
                                'x-auth-token': token
                            },
                            body: photoFormData
                        });

                        if (!photoResponse.ok) {
                            const photoError = await photoResponse.json();
                            throw new Error(photoError.message || 'Erreur lors de l\'upload de la photo');
                        }
                    }

                    // Fermer la modal et recharger les données
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
                    modal.hide();
                    form.reset();
                    document.getElementById('studentPhotoPreview').style.display = 'none';
                    loadStudents();
                    loadDashboardData();
                } else {
                    if (data.errors) {
                        alert('Erreurs de validation :\n' + data.errors.join('\n'));
                    } else {
                        throw new Error(data.message || 'Erreur lors de l\'enregistrement de l\'étudiant');
                    }
                }
            } catch (error) {
                console.error('Error saving student:', error);
                if (error.message.includes('Non authentifié')) {
                    window.location.href = '/login.html';
                } else {
                    alert(error.message || 'Erreur lors de l\'enregistrement de l\'étudiant. Veuillez réessayer.');
                }
            }
        });
    }

    // Add notification
    const saveNotificationBtn = document.getElementById('saveNotificationBtn');
    if (saveNotificationBtn) {
        saveNotificationBtn.addEventListener('click', async function() {
            const form = document.getElementById('addNotificationForm');
            const formData = new FormData(form);
            const imageFile = document.getElementById('notificationImage').files[0];
            const imageUrl = document.getElementById('notificationImageUrl').value;

            // Vérifier qu'au moins une source d'image est fournie si l'utilisateur en a sélectionné une
            if (imageFile || imageUrl) {
                try {
                    let finalImageUrl = imageUrl;

                    // Si un fichier est sélectionné, l'uploader d'abord
                    if (imageFile) {
                        const uploadFormData = new FormData();
                        uploadFormData.append('image', imageFile);

                        const uploadResponse = await fetch(`${API_URL}/notifications/upload-image`, {
                            method: 'POST',
                            headers: {
                                'x-auth-token': localStorage.getItem('adminToken')
                            },
                            body: uploadFormData
                        });

                        if (!uploadResponse.ok) {
                            throw new Error('Failed to upload image');
                        }

                        const uploadData = await uploadResponse.json();
                        finalImageUrl = uploadData.imageUrl;
                    }

                    const notificationData = {
                        title: formData.get('notificationTitle'),
                        message: formData.get('notificationMessage'),
                        type: formData.get('notificationType'),
                        imageUrl: finalImageUrl,
                        isActive: true
                    };

                    const response = await fetch(`${API_URL}/notifications`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': localStorage.getItem('adminToken')
                        },
                        body: JSON.stringify(notificationData)
                    });

                    if (response.ok) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('addNotificationModal'));
                        modal.hide();
                        form.reset();
                        document.getElementById('notificationImagePreview').style.display = 'none';
                        loadNotifications();
                        loadDashboardData();
                    } else {
                        throw new Error('Failed to add notification');
                    }
                } catch (error) {
                    console.error('Error adding notification:', error);
                    alert('Failed to add notification. Please try again.');
                }
            } else {
                // Créer la notification sans image
                const notificationData = {
                    title: formData.get('notificationTitle'),
                    message: formData.get('notificationMessage'),
                    type: formData.get('notificationType'),
                    isActive: true
                };

                try {
                    const response = await fetch(`${API_URL}/notifications`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': localStorage.getItem('adminToken')
                        },
                        body: JSON.stringify(notificationData)
                    });

                    if (response.ok) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('addNotificationModal'));
                        modal.hide();
                        form.reset();
                        loadNotifications();
                        loadDashboardData();
                    } else {
                        throw new Error('Failed to add notification');
                    }
                } catch (error) {
                    console.error('Error adding notification:', error);
                    alert('Failed to add notification. Please try again.');
                }
            }
        });
    }

    // Prévisualisation de l'image
    const notificationImage = document.getElementById('notificationImage');
    const notificationImageUrl = document.getElementById('notificationImageUrl');
    const notificationImagePreview = document.getElementById('notificationImagePreview');

    if (notificationImage) {
        notificationImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    notificationImagePreview.src = e.target.result;
                    notificationImagePreview.style.display = 'block';
                    notificationImageUrl.value = ''; // Réinitialiser l'URL si un fichier est sélectionné
                };
                reader.readAsDataURL(file);
            } else {
                notificationImagePreview.style.display = 'none';
            }
        });
    }

    if (notificationImageUrl) {
        notificationImageUrl.addEventListener('input', function(e) {
            const url = e.target.value;
            if (url) {
                notificationImagePreview.src = url;
                notificationImagePreview.style.display = 'block';
                notificationImage.value = ''; // Réinitialiser le fichier si une URL est entrée
            } else {
                notificationImagePreview.style.display = 'none';
            }
        });
    }

    // Firebase config form
    const firebaseConfigForm = document.getElementById('firebaseConfigForm');
    if (firebaseConfigForm) {
        firebaseConfigForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const config = {
                apiKey: formData.get('apiKey'),
                projectId: formData.get('projectId')
            };

            try {
                const response = await fetch(`${API_URL}/settings/firebase`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(config)
                });

                if (response.ok) {
                    alert('Firebase configuration saved successfully');
                } else {
                    throw new Error('Failed to save Firebase configuration');
                }
            } catch (error) {
                console.error('Error saving Firebase configuration:', error);
                alert('Failed to save Firebase configuration. Please try again.');
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                const response = await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST'
                });

                if (response.ok) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminName');
                    window.location.href = '/login.html';
                } else {
                    throw new Error('Failed to logout');
                }
            } catch (error) {
                console.error('Error logging out:', error);
                alert('Failed to logout. Please try again.');
            }
        });
    }

    // Import students
    const importStudentsBtn = document.getElementById('importStudentsBtn');
    if (importStudentsBtn) {
        importStudentsBtn.addEventListener('click', async function() {
            const form = document.getElementById('importStudentsForm');
            const fileInput = document.getElementById('csvFile');
            const importResults = document.getElementById('importResults');
            const successCount = document.getElementById('successCount');
            const failedCount = document.getElementById('failedCount');
            const errorList = document.getElementById('errorList');

            if (!fileInput.files.length) {
                alert('Veuillez sélectionner un fichier CSV');
                return;
            }

            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            try {
                const response = await fetch(`${API_URL}/students/bulk`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    // Show results
                    importResults.style.display = 'block';
                    successCount.textContent = data.results.success;
                    failedCount.textContent = data.results.failed;

                    // Show errors if any
                    if (data.results.errors.length > 0) {
                        errorList.innerHTML = '<h6>Détails des erreurs :</h6>' +
                            data.results.errors.map(error => `<div class="text-danger">${error}</div>`).join('');
                    } else {
                        errorList.innerHTML = '';
                    }

                    // Reload students list
                    loadStudents();
                    loadDashboardData();

                    // Reset form
                    form.reset();
                } else {
                    throw new Error(data.message || 'Erreur lors de l\'import');
                }
            } catch (error) {
                console.error('Error importing students:', error);
                alert('Erreur lors de l\'import des étudiants. Veuillez réessayer.');
            }
        });
    }

    // Add class filter event listener
    const classFilter = document.getElementById('classFilter');
    if (classFilter) {
        classFilter.addEventListener('change', loadStudents);
    }

    // Initial load
    loadDashboardData();
    loadStudents();
    loadNotifications();
});

// Global functions for table actions
async function editStudent(id) {
    try {
        const response = await fetch(`${API_URL}/students/${id}`, {
            headers: {
                'x-auth-token': localStorage.getItem('adminToken')
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch student details');
        }
        const student = await response.json();
        
        // Populate the edit form
        document.getElementById('studentId').value = student._id;
        document.getElementById('studentIdInput').value = student.studentId;
        document.getElementById('firstName').value = student.firstName;
        document.getElementById('lastName').value = student.lastName;
        document.getElementById('email').value = student.email;
        document.getElementById('class').value = student.class;
        document.getElementById('password').value = '';
        
        // Afficher la photo existante
        displayStudentPhoto(student.photo);
        
        currentStudentId = id;
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addStudentModal'));
        modal.show();
        
        // Update the save button to handle edit
        const saveBtn = document.getElementById('saveStudentBtn');
        saveBtn.onclick = async () => {
            try {
                const form = document.getElementById('studentForm');
                const studentId = document.getElementById('studentIdInput').value;
                const firstName = document.getElementById('firstName').value;
                const lastName = document.getElementById('lastName').value;
                const email = document.getElementById('email').value;
                const studentClass = document.getElementById('class').value;
                const password = document.getElementById('password').value;
                const studentData = {
                    studentId,
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`,
                    email,
                    class: studentClass
                };
                if (password) {
                    studentData.password = password;
                }
                const updateResponse = await fetch(`${API_URL}/students/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': localStorage.getItem('adminToken')
                    },
                    body: JSON.stringify(studentData)
                });
                if (updateResponse.ok) {
                    modal.hide();
                    loadStudents();
                    loadDashboardData();
                } else {
                    const data = await updateResponse.json();
                    throw new Error(data.message || 'Failed to update student');
                }
            } catch (error) {
                console.error('Error updating student:', error);
                alert(error.message || 'Erreur lors de la mise à jour de l\'étudiant. Veuillez réessayer.');
            }
        };
    } catch (error) {
        console.error('Error fetching student details:', error);
        alert('Erreur lors de la récupération des détails de l\'étudiant. Veuillez réessayer.');
    }
}

async function deleteStudent(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
        try {
            const response = await fetch(`${API_URL}/students/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': localStorage.getItem('adminToken')
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete student');
            }

            // Reload the students list and dashboard
            await loadStudents();
            await loadDashboardData();
        } catch (error) {
            console.error('Error deleting student:', error);
            alert(error.message || 'Erreur lors de la suppression de l\'étudiant. Veuillez réessayer.');
        }
    }
}

async function deleteNotification(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
        try {
            const response = await fetch(`${API_URL}/notifications/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadNotifications();
                loadDashboardData();
            } else {
                throw new Error('Failed to delete notification');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Failed to delete notification. Please try again.');
        }
    }
} 

// Fonction pour afficher la photo de l'étudiant
function displayStudentPhoto(photoPath) {
    const photoPreview = document.getElementById('studentPhotoPreview');
    if (photoPath) {
        photoPreview.src = `/api/students/${currentStudentId}/photo`;
        photoPreview.style.display = 'block';
    } else {
        photoPreview.style.display = 'none';
    }
}

// Gestionnaire d'événement pour la prévisualisation de la photo
document.getElementById('studentPhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoPreview = document.getElementById('studentPhotoPreview');
            photoPreview.src = e.target.result;
            photoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Fonction pour modifier une notification
async function editNotification(id) {
    try {
        const response = await fetch(`${API_URL}/notifications/${id}`, {
            headers: {
                'x-auth-token': localStorage.getItem('adminToken')
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch notification details');
        }
        
        const notification = await response.json();
        
        // Remplir le formulaire
        document.getElementById('notificationTitle').value = notification.title;
        document.getElementById('notificationMessage').value = notification.message;
        document.getElementById('notificationType').value = notification.type;
        
        // Gérer l'image
        const imagePreview = document.getElementById('notificationImagePreview');
        if (notification.imageUrl) {
            imagePreview.src = notification.imageUrl;
            imagePreview.style.display = 'block';
            document.getElementById('notificationImageUrl').value = notification.imageUrl;
        } else {
            imagePreview.style.display = 'none';
            document.getElementById('notificationImageUrl').value = '';
        }
        
        // Afficher la modal
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addNotificationModal'));
        modal.show();
        
        // Mettre à jour le bouton de sauvegarde pour gérer la modification
        const saveBtn = document.getElementById('saveNotificationBtn');
        saveBtn.onclick = async () => {
            try {
                const form = document.getElementById('addNotificationForm');
                const formData = new FormData(form);
                const imageFile = document.getElementById('notificationImage').files[0];
                const imageUrl = document.getElementById('notificationImageUrl').value;
                
                let finalImageUrl = notification.imageUrl; // Garder l'URL existante par défaut
                
                // Si une nouvelle image est fournie
                if (imageFile || imageUrl) {
                    if (imageFile) {
                        const uploadFormData = new FormData();
                        uploadFormData.append('image', imageFile);
                        
                        const uploadResponse = await fetch(`${API_URL}/notifications/upload-image`, {
                            method: 'POST',
                            headers: {
                                'x-auth-token': localStorage.getItem('adminToken')
                            },
                            body: uploadFormData
                        });
                        
                        if (!uploadResponse.ok) {
                            throw new Error('Failed to upload image');
                        }
                        
                        const uploadData = await uploadResponse.json();
                        finalImageUrl = uploadData.imageUrl;
                    } else if (imageUrl) {
                        finalImageUrl = imageUrl;
                    }
                }
                
                const notificationData = {
                    title: formData.get('notificationTitle'),
                    message: formData.get('notificationMessage'),
                    type: formData.get('notificationType'),
                    imageUrl: finalImageUrl,
                    isActive: notification.isActive
                };
                
                const updateResponse = await fetch(`${API_URL}/notifications/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': localStorage.getItem('adminToken')
                    },
                    body: JSON.stringify(notificationData)
                });
                
                if (updateResponse.ok) {
                    modal.hide();
                    form.reset();
                    imagePreview.style.display = 'none';
                    loadNotifications();
                    loadDashboardData();
                } else {
                    throw new Error('Failed to update notification');
                }
            } catch (error) {
                console.error('Error updating notification:', error);
                alert('Failed to update notification. Please try again.');
            }
        };
    } catch (error) {
        console.error('Error fetching notification details:', error);
        alert('Failed to fetch notification details. Please try again.');
    }
} 