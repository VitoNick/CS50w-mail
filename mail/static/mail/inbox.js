document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector("#emails-view").style.display = "block";
	document.querySelector("#compose-view").style.display = "none";
	// document.querySelector("#open-email").style.display = "none"; // Hide email details

	// Show the mailbox name
	document.querySelector("#emails-view").innerHTML = `<h3>${
		mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
	}</h3>`;

	// load mailbox
	fetch(`/emails/${mailbox}`)
		.then((response) => response.json())
		.then((emails) => {
			// Print emails
			console.log(emails);
			
			// Create the <ul> element
			const ul = document.createElement('ul');
			
			// Add each email as a <li>
			emails.forEach((email) => {
				// Create the <li> element
				const li = document.createElement('li');
				li.textContent = `${email.subject} - ${email.sender} - ${email.timestamp}`;
				
				// Add CSS class based on read status
				if (email.read) {
					li.classList.add('read');
				} else {
					li.classList.add('unread');
				}
				
				// Add click listener to THIS specific <li>
				li.addEventListener("click", () => {
          // Marking the email as read/unread
          // TODO: Refactor to avoid toggling when loading mailbox
          // TODO: Add "unread" button to email view
					email.read = true;
          // Debugging log
					console.log(email.read);
					fetch(`/emails/${email.id}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							read: email.read
						})
					})
					.then(response => {
						if (response.ok) {
							console.log(`Email ${email.id} marked as read: ${email.read}`);
							load_mailbox('inbox');
						} else {
							console.error('Failed to update email');
						}
					})
          // local only catch for things like server being down
					.catch(error => console.error('Error:', error));
          // Fetch and display email details
          fetch(`/emails/${email.id}`, {
            method: 'GET'
          })
          .then(response => response.json())
          .then(emailDetails => {
            // debug log email
            console.log(`From: ${emailDetails.sender}\nTo: ${emailDetails.recipients}\nSubject: ${emailDetails.subject}\n\n${emailDetails.body}`);
            // Display email details in the "open-email" div
            const openEmailDiv = document.querySelector('#open-email');
            openEmailDiv.style.display = 'block'; // Show the email details
            openEmailDiv.innerHTML = `
            <button id="close-email" style="float: right; cursor: pointer;">&times;</button>
            <button id="mark-email-unread" style="float: right; cursor: pointer;">Mark Unread</button>
            <h4>${emailDetails.subject}</h4>
              <p><strong>From:</strong> ${emailDetails.sender}</p>
              <p><strong>To:</strong> ${emailDetails.recipients}</p>
              <p><strong>Timestamp:</strong> ${emailDetails.timestamp}</p>
              <hr>
              <p>${emailDetails.body}</p>
            `;
            
            // Add close button listener
            document.querySelector('#close-email').addEventListener('click', () => {
              openEmailDiv.style.display = 'none';
            });
            // Add mark unread button listener
            document.querySelector('#mark-email-unread').addEventListener('click', () => {
              email.read = false;
              fetch(`/emails/${email.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                read: email.read
              })
              })
              // After marking as unread, update the UI
              .then(() => {
              li.classList.remove('read');
              li.classList.add('unread');
              load_mailbox('inbox');
              });
            });
          });
				});
				
				// Append this <li> to the <ul> (This is the important part that fixed the innerHTML issue)
				ul.appendChild(li);
			});
			
			// Append the <ul> to the emails-view
			document.querySelector('#emails-view').appendChild(ul);
		});
} 

function send_email() {
	// get form data
	const recipients = document.querySelector("#compose-recipients").value;
	const subject = document.querySelector("#compose-subject").value;
	const body = document.querySelector("#compose-body").value;

	// Send email data to server
	fetch("/emails", {
		method: "POST",
		body: JSON.stringify({
			recipients: recipients,
			subject: subject,
			body: body,
		}),
	})
		.then((response) => response.json())
		.then((result) => {
			// Print result
			console.log(result);
		});
  load_mailbox('sent');
}