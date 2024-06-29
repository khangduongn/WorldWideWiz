import { pregeneratedQuizzes } from "./pregeneratedQuizzes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (let quiz of pregeneratedQuizzes) {
    await prisma.quiz.create({
      data: quiz,
    });
  }
}

main()
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    prisma.$disconnect();
  });
