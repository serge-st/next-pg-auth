import { NextPage } from 'next';

interface UserProps {
  params: {
    id: string;
  };
}

const User: NextPage<UserProps> = ({ params: { id } }) => {
  return <h1 className="w-full text-center text-lg">User {id}</h1>;
};

export default User;
