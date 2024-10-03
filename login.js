$(document).ready(function() {
    // Handle user signup
    $('#signupBtn').on('click', function() {
        const name = $('#signupName').val().trim();
        const email = $('#signupEmail').val().trim();
        const password = $('#signupPassword').val().trim();
 
        if (name && email && password) {
            const user = {
                name: name,
                email: email,
                password: password,
            };
 
            // Create a new document in the Users collection
            $.ajax({
                url: `https://firestore.googleapis.com/v1/projects/inventorydetails-6d9ae/databases/(default)/documents/Users`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    fields: {
                        name: { stringValue: user.name },
                        email: { stringValue: user.email },
                        password: { stringValue: user.password }
                    }
                }),
                success: function(response) {
                    alert('Signup successful! You can now log in.');
                    // Optionally reset the form
                    $('#signupName').val('');
                    $('#signupEmail').val('');
                    $('#signupPassword').val('');
                },
                error: function(error) {
                    console.error('Error signing up:', error);
                    alert('Failed to sign up. Please try again.');
                }
            });
        } else {
            alert('Please fill in all fields correctly.');
        }
    });
 
    // Handle user login
    $('#loginBtn').on('click', function() {
        const email = $('#loginEmail').val().trim();
        const password = $('#loginPassword').val().trim();
 
        if (email && password) {
            // In a real application, you would authenticate using Firebase Authentication.
            // Here, we're just checking if the user exists in the Firestore collection.
            $.ajax({
                url: `https://firestore.googleapis.com/v1/projects/inventorydetails-6d9ae/databases/(default)/documents/Users`,
                method: 'GET',
                contentType: 'application/json',
                success: function(response) {
                    const users = response.documents;
                    const user = users.find(user => user.fields.email.stringValue === email && user.fields.password.stringValue === password);
 
                    if (user) {
                        // Redirect based on user type
                        const userType = $('#userType').val();
                        if (userType === 'admin') {
                            window.location.href = 'admin.html'; // Admin panel page
                        } else {
                            window.location.href = 'inventory-home.html'; // Customer home page
                        }
                    } else {
                        alert('Invalid email or password. Please try again.');
                    }
                },
                error: function(error) {
                    console.error('Error fetching users:', error);
                    alert('Failed to log in. Please try again.');
                }
            });
        } else {
            alert('Please fill in all fields correctly.');
        }
    });
});
 