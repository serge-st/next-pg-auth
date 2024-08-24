import { NextPage } from 'next';

interface UserPageProps {
  params: {
    id: string;
  };
}

const UserPage: NextPage<UserPageProps> = ({ params: { id } }) => {
  return <h1 className="w-full text-center text-2xl">User {id}</h1>;
};

export default UserPage;
