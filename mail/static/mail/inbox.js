document.addEventListener("DOMContentLoaded", function () {
	// Use buttons to toggle between views
	document
		.querySelector("#inbox")
		.addEventListener("click", () => load_mailbox("inbox"));
	document
		.querySelector("#sent")
		.addEventListener("click", () => load_mailbox("sent"));
	document
		.querySelector("#archived")
		.addEventListener("click", () => load_mailbox("archive"));
	document.querySelector("#compose").addEventListener("click", compose_email);
	document.querySelector("#send").addEventListener("click", send_email);

	// By default, load the inbox
	load_mailbox("inbox");
});

function compose_email() {
	// Show compose view and hide other views
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#open-email").style.display = "none";
	document.querySelector("#compose-view").style.display = "block";

	// Clear out composition fields
	document.querySelector("#compose-recipients").value = "";
	document.querySelector("#compose-subject").value = "";
	document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector("#emails-view").style.display = "block";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#open-email").style.display = "none";

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
			const ul = document.createElement("ul");

			// Add each email as a <li>
			emails.forEach((email) => {
				// Create the <li> element
				const li = document.createElement("li");
				li.textContent = `${email.subject} - ${email.sender} - ${email.timestamp}`;

				// Add CSS class based on read status
				if (email.read) {
					li.classList.add("read");
				} else {
					li.classList.add("unread");
				}

				// Add click listener to THIS specific <li>
				li.addEventListener("click", () => {
					// Marking the email as read/unread
					email.read = true;
					// Debugging log
					console.log(email.read);
					fetch(`/emails/${email.id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							read: email.read,
						}),
					})
						.then((response) => {
							if (response.ok) {
								console.log(
									`Email ${email.id} marked as read: ${email.read}`
								);
								// Update the UI to reflect read status
								li.classList.remove("unread");
								li.classList.add("read");
							} else {
								console.error("Failed to update email");
							}
						})
						// Local only catch for things like server being down
						.catch((error) => console.error("Error:", error));
					// Fetch and display email details
					fetch(`/emails/${email.id}`, {
						method: "GET",
					})
						.then((response) => response.json())
						.then((emailDetails) => {
							// Debug log email
							console.log(
								`From: ${emailDetails.sender}\nTo: ${emailDetails.recipients}\nSubject: ${emailDetails.subject}\n\n${emailDetails.body}`
							);
							// Display email details in the "open-email" div
							const openEmailDiv = document.querySelector("#open-email");
							openEmailDiv.style.display = "block"; // Show the email details
							openEmailDiv.innerHTML = `
                <button id="close-email" style="float: right; cursor: pointer;">&times;</button>
                <button id="un-read-email" style="float: right; cursor: pointer;">Mark Unread</button>
                <button id="archive-email" style="float: right; cursor: pointer;">Archive</button>
                <button id="reply-email" style="float: right; cursor: pointer;">Reply</button>

              <h4>${emailDetails.subject}</h4>
                <p><strong>From:</strong> ${emailDetails.sender}</p>
                <p><strong>To:</strong> ${emailDetails.recipients}</p>
                <p><strong>Timestamp:</strong> ${emailDetails.timestamp}</p>
                <hr>
                <p>${emailDetails.body}</p>
            `;

							// Add close button listener
							openEmailDiv
								.querySelector("#close-email")
								.addEventListener("click", () => {
									openEmailDiv.style.display = "none";
								});
							// Add mark unread button listener
							openEmailDiv
								.querySelector("#un-read-email")
								.addEventListener("click", () => {
									email.read = false;
									fetch(`/emails/${email.id}`, {
										method: "PUT",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({
											read: email.read,
										}),
									})
										.then((response) => {
											if (response.ok) {
												// After marking as unread, update the UI
												li.classList.remove("read");
												li.classList.add("unread");
											} else {
												console.error(
													"Failed to update email"
												);
											}
										})
										.catch((error) =>
											console.error("Error:", error)
									);
								});

							// Capture the archive button and set its initial state
							const archiveButton =
								openEmailDiv.querySelector("#archive-email");
              // When and how to show the archive button
							if (mailbox === "sent") {
								archiveButton.style.display = "none";
							} else if (mailbox === "archive") {
								archiveButton.textContent = "Unarchive";
							}

              // Add reply button listener
							const replyButton =
								openEmailDiv.querySelector("#reply-email");
							replyButton.addEventListener("click", () => {
								console.log(
									"reply button click listener added"
								);

                // What to do when reply is clicked

                // grab sender and subject first and store
                const sender = emailDetails.sender;
                let subject = emailDetails.subject;
                const body = `\n\nOn ${emailDetails.timestamp} ${emailDetails.sender} wrote:\n${emailDetails.body}`;

                // if subject doesn't start with "Re:", add it
                if (!subject.startsWith("Re:")) {
                  subject = "Re: " + subject;
                }
                
                // open compose view
                compose_email();

                // set compose-recipients to emailDetails.sender
                document.querySelector("#compose-recipients").value = sender;
                // set compose-subject to subject
                document.querySelector("#compose-subject").value = subject;
                // set compose-body to body
                document.querySelector("#compose-body").value = body;

							});

							// Add archive/unarchive button listener and logic
							archiveButton.addEventListener("click", () => {
								const oldArchivedStatus = email.archived;
								email.archived = !email.archived;
								fetch(`/emails/${email.id}`, {
									method: "PUT",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										archived: email.archived,
									}),
								})
									.then((response) => {
										if (response.ok) {
											openEmailDiv.style.display = "none";
											li.remove();
										} else {
											email.archived = oldArchivedStatus; // revert back on failure
											console.error(
												"Failed to update email",
												response.status
											);
										}
									})
									.catch((error) => {
										email.archived = oldArchivedStatus; // revert back on failure
										console.error(
											"Network error updating email",
											error
										);
									});
							});
						});
				});

				// Append this <li> to the <ul> (This is the important part that fixed the innerHTML issue)
				ul.appendChild(li);
			});

			// Append the <ul> to the emails-view
			document.querySelector("#emails-view").appendChild(ul);
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
	load_mailbox("sent");
}
