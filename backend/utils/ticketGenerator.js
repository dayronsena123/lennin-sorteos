export const generateTicketID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'TK';
  for (let i=0;i<10;i++) id += chars.charAt(Math.floor(Math.random()*chars.length));
  return id;
};
