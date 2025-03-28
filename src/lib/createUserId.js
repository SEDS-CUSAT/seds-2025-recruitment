import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const nanoid = customAlphabet(alphabet, 10);

export const createUserId = () => {
  return "SC_" + nanoid();
}

for (let i = 0; i < 10; i++) {
  console.log(createUserId());
}