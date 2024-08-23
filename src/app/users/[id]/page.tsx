interface UserProps {
  params: {
    id: string;
  };
}

const User = ({ params }: UserProps) => {
  return <h1 className="w-full text-center text-lg">User {params.id}</h1>;
};

export default User;
