



export enum Pages {
    ACCOUNT = "/account",
    // Regular User
        // A page that displays the current available points.
        // A page that displays the user's QR code for the purpose of initiating a transaction.
        // A page that allows the user to manually enter a user ID to transfer points
            // QR code scanning capability is NOT required.
        // A page that allows the user to make a point redemption request
        // A page that displays the QR code of an unprocessed redemption request.
    
    USERS= "/users",
    // A page that displays all users with filters, order-by, and pagination).
    // A page that allows managers to update users, e.g., make a user verified, promote a user to cashier, etc.
    
    TRANSACTIONS= "/transactions",
    // Regular User
        // A page that displays all past transactions for the current logged in user (with filters, order-by, and pagination).
        // Each transaction card should be displayed "nicely", e.g., instead of relatedId , it should display the utorid of the sender/receiver.
        // Some way to make each transaction type distinct in appearance, e.g., using different colors.

    // Cashier
        // A page that allows the cashier to create a transaction.
        // QR code scanning capability is NOT required.
        // A page that allows the cashier to manually enter a transaction ID to process redemption requests.
        // QR code scanning capability is NOT required.

    // Manager
        // A page that displays ALL transactions (with filters, order-by, and pagination).
        // A page that displays a specific transaction, with the option of creating an adjustment transaction for it, and marking it as suspicious.

    PROMOTIONS= "/promotions",
    // Regular User
        // A page that displays all available promotions.
    // Manager
    // A page that allows managers to create new promotions.
    // A page that displays all promotions (with filters, order-by, and pagination).
    // A page that allows managers to view/edit/delete a specific promotion.
    
    EVENTS= "/events",
    // Regular User
        // A page that displays all published events.
        // A page that displays a specific event and allows a user to RSVP to an event.

    // Manager 
        // A page that allows managers to create new events.
        // A page that displays all events (with filters, order-by, and pagination).
        // A page that allows managers to view/edit/delete a specific event.
        // A page that allows managers to add or remove users from an event.
    // Manager + Organizer
        // A page that displays the events that the user is responsible for.
        // A page that allows the user to view/edit a specific event that he/she is responsible for.
        // A page that allows adding a user to the event that he/she is responsible for.
        // A page that allows awarding points to a single guest, or to all guests who have RSVPed

    HOME = '/'
}   
