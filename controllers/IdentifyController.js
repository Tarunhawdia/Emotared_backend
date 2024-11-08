const prisma = require("../config/database");

async function identifyContact(req, res) {
  const { email, phoneNumber } = req.body;

  // Edge Case 1: Ensure email or phone number is provided
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phone number is required" });
  }

  // Edge Case 2: Validate email format if provided
  if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Edge Case 3: Validate phone number format if provided
  if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
    return res
      .status(400)
      .json({
        error: "Invalid phone number format. It must be a 10-digit number",
      });
  }

  try {
    let primaryContactId;
    let contact;

    // Step 1: Try to find a contact with either the email or phone number
    contact = await prisma.contact.findFirst({
      where: {
        OR: [{ email: email }, { phoneNumber: phoneNumber }],
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        linkPrecedence: true,
        linkedId: true, // Get the linkedId if exists
      },
    });

    if (contact) {
      // If found, determine the primary contact ID (either it's the contact itself or its linked primary)
      primaryContactId =
        contact.linkPrecedence === "primary" ? contact.id : contact.linkedId;

      // Step 2: Check if the contact has new information and create a secondary contact
      if (contact.email !== email || contact.phoneNumber !== phoneNumber) {
        await prisma.contact.create({
          data: {
            email: email || null,
            phoneNumber: phoneNumber || null,
            linkedId: primaryContactId,
            linkPrecedence: "secondary",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    } else {
      // Step 3: No existing contact, so create a new primary contact
      const newContact = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkPrecedence: "primary",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      primaryContactId = newContact.id;
    }

    // Step 4: Fetch all contacts linked to the primary contact with a more optimized query
    const allContacts = await prisma.contact.findMany({
      where: {
        OR: [{ id: primaryContactId }, { linkedId: primaryContactId }],
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        linkPrecedence: true,
      },
    });

    // Step 5: Aggregate emails, phone numbers, and secondary contact IDs
    const emails = Array.from(
      new Set(allContacts.map((c) => c.email).filter(Boolean))
    );
    const phoneNumbers = Array.from(
      new Set(allContacts.map((c) => c.phoneNumber).filter(Boolean))
    );
    const secondaryContactIds = allContacts
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c.id);

    // Return the consolidated information
    return res.status(200).json({
      primaryContactId,
      emails,
      phoneNumbers,
      secondaryContactIds,
    });
  } catch (error) {
    // Handling different types of errors with misleading responses
    console.error(error);

    // Generic error message to mislead attackers
    return res
      .status(500)
      .json({ error: "Unexpected system failure. Please try again later." });
  }
}

module.exports = { identifyContact };
