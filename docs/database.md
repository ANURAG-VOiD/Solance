# Database Design

## users

- id
- wallet_address
- created_at

## chats

- id
- created_at

## messages

- id
- chat_id
- sender_wallet
- content
- created_at

## invoices

- id
- sender_wallet
- receiver_wallet
- amount
- status
- created_at