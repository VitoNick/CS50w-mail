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
					email.read = !email.read;
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
					.then(() => load_mailbox('inbox'));
				});
				
				// Append this <li> to the <ul>
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