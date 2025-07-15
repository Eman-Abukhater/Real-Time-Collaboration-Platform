import { Query, Resolver } from 'type-graphql';

@Resolver()
export class HelloResolver {
  @Query(returns => String) // Alternative syntax that always works
  hello(): string {
    return "Test successful! Backend is working!";
  }
}