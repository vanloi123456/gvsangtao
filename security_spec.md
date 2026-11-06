# Security Specification: GIÁO VIÊN SÁNG TẠO

## 1. Data Invariants
1. Resource ownership: `authorId` must strictly equal `request.auth.uid` on resource creation.
2. Immutability: `authorId` and `createdAt` cannot be modified after document creation.
3. Length & type safety: All string fields (`title`, `description`, `url`, etc.) must have bounded lengths to prevent Denial of Wallet.
4. Access control: All educational resources (`apps`, `games`, `simulations`) can be read by anyone (public educational repository). Mutations (create, update, delete) require authentication (`request.auth != null`).
5. Only the author or the bootstrap administrator (`daovanloi.tankhanhtrung3@gmail.com`) can update or delete a resource.
6. User profiles can only be written by the authenticated owner (`request.auth.uid == userId`).

## 2. The Dirty Dozen Payloads (Negative Tests)
1. **Spoofed Author ID**: Creating an app with `authorId: "someone_else_uid"`. Expect: `PERMISSION_DENIED`.
2. **Missing Required Fields**: Creating an app without `title`. Expect: `PERMISSION_DENIED`.
3. **Payload Bloat Attack**: Creating a resource with `description` > 10,000 characters. Expect: `PERMISSION_DENIED`.
4. **ID Poisoning Attack**: Writing to a document ID with 500 characters or special injection characters. Expect: `PERMISSION_DENIED`.
5. **Unauthorized Update**: User B modifying an app authored by User A. Expect: `PERMISSION_DENIED`.
6. **Author Field Hijack**: User attempting to change `authorId` during an update. Expect: `PERMISSION_DENIED`.
7. **Created Timestamp Manipulation**: Changing `createdAt` on an existing document. Expect: `PERMISSION_DENIED`.
8. **Shadow Field Injection**: Adding an unapproved administrative field `isAdmin: true` into the app document. Expect: `PERMISSION_DENIED`.
9. **Unauthenticated Deletion**: Anonymous user attempting to delete a game. Expect: `PERMISSION_DENIED`.
10. **Profile Impersonation**: User A attempting to write to `/users/{userB_id}`. Expect: `PERMISSION_DENIED`.
11. **Malicious Protocol Injection**: Inserting non-HTTP(S) or invalid strings into resource URLs. Expect: `PERMISSION_DENIED`.
12. **Blanket Write to Root**: Attempting write to arbitrary root paths not in the blueprint. Expect: `PERMISSION_DENIED`.
