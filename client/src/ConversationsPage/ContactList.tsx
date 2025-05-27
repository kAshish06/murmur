// This is a placeholder component. You'll replace this with actual contact fetching and rendering logic.
export default function ContactList() {
  // Dummy contacts for structure
  const dummyContacts = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
    { id: "3", name: "Charlie" },
  ];

  return (
    <div className="">
      <ul>
        {dummyContacts.map((contact) => (
          <li key={contact.id} className="py-2 cursor-pointer hover:bg-gray-50">
            {/* In a real app, clicking this would select the contact */}
            {contact.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
