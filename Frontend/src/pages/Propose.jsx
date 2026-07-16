import { useState } from "react";

const Propose = () => {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      text: "Add dark mode theme to the website",
      upvotes: 0,
      downvotes: 0,
      user: {
        name: "Ahmed Mohamed",
        avatar: "https://i.sstatic.net/DPGsM.png",
      },
    },
    {
      id: 2,
      text: "Add ability to filter books by language",
      upvotes: 0,
      downvotes: 0,
      user: {
        name: "Sara Ali",
        avatar: "https://i.sstatic.net/DPGsM.png",
      },
    },
    {
      id: 3,
      text: "Create a reading list feature to save books for later",
      upvotes: 0,
      downvotes: 0,
      user: {
        name: "Mohamed Hassan",
        avatar: "https://i.sstatic.net/DPGsM.png",
      },
    },
  ]);

  const sortedProposals = [...proposals].sort((a, b) => {
    const scoreA = a.upvotes - a.downvotes;
    const scoreB = b.upvotes - b.downvotes;
    return scoreB - scoreA;
  });

  const handleDelete = (id) => {
    setProposals(proposals.filter((p) => p.id !== id));
  };

  const handleEdit = (id) => {
    const proposal = proposals.find((p) => p.id === id);
    const newText = prompt("Edit your proposal:", proposal.text);
    if (newText !== null && newText.trim() !== "") {
      setProposals(
        proposals.map((p) => (p.id === id ? { ...p, text: newText } : p)),
      );
    }
  };

  const handleUpVote = (id) => {
    setProposals(
      proposals.map((p) =>
        p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p,
      ),
    );
  };
  const handleDownVote = (id) => {
    setProposals(
      proposals.map((p) =>
        p.id === id ? { ...p, downvotes: p.downvotes + 1 } : p,
      ),
    );
  };
  return (
    <div className="flex items-center justify-center flex-col mt-8 md:mt-16 px-4">
      <div className="flex flex-col items-center justify-center p-4 md:p-9 text-center">
        <h1 className="font-bold text-gray-800 mb-4 text-4xl md:text-6xl">
          Share your propose!
        </h1>
        <p className="font-medium text-base md:text-lg text-gray-600 max-w-md p-2 md:p-4">
          Have a book propose? Let us know !
        </p>
      </div>

      <div className="bg-[#3ea388] p-3 md:p-4 w-full max-w-[55rem] flex items-center flex-col justify-center rounded-2xl">
        <textarea
          placeholder="Add your propose"
          dir="auto"
          className="font-semibold rounded-2xl p-3 md:p-4 bg-gray-50 w-full text-base md:text-xl resize-none outline-none focus:ring-2 focus:ring-[#358a74] border border-gray-300"
          rows={1}
        ></textarea>
        <div className="mt-4 flex justify-between items-center w-full">
          <div className="post-attachs flex items-center">
            <i className="fa-regular fa-image text-white cursor-pointer text-xl md:text-2xl mr-4"></i>
            <i className="fa-solid fa-paperclip text-white cursor-pointer text-xl md:text-2xl"></i>
          </div>
          <button className="bg-white text-black px-3 md:px-4 py-2 cursor-pointer rounded-2xl font-bold text-sm md:text-base">
            Post
          </button>
        </div>
      </div>

      {/* Posts Section */}
      <div className="w-full max-w-[55rem] mt-8 flex flex-col gap-4 mb-12">
        <h2 className="font-bold text-2xl md:text-3xl text-gray-800 mb-2">
          Recent Proposals
        </h2>
        {proposals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No proposals yet. Be the first to share your idea!
          </p>
        ) : (
          sortedProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-[#3ea388] p-4 md:p-5 w-full rounded-2xl"
            >
              <div className="flex items-start gap-3 md:gap-4">
                {/* User Info & Vote Section */}
                <div className="flex gap-3 md:gap-4 flex-1 min-w-0">
                  {/* User Avatar */}
                  <img
                    src={proposal.user.avatar}
                    alt={proposal.user.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Username */}
                    <p className="text-white font-semibold text-sm md:text-lg mb-1 truncate">
                      {proposal.user.name}
                    </p>

                    {/* Proposal Text */}
                    <p className="text-white text-base md:text-xl font-semibold mb-3 break-words">
                      {proposal.text}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(proposal.id)}
                        className="flex items-center gap-1 text-white/80 hover:text-white transition cursor-pointer text-xs md:text-sm"
                      >
                        <i className="fa-solid fa-pen-to-square text-sm md:text-base"></i>
                        <span className="font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="flex items-center gap-1 text-white/80 hover:text-red-200 transition cursor-pointer text-xs md:text-sm"
                      >
                        <i className="fa-solid fa-trash text-sm md:text-base"></i>
                        <span className="font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vote Buttons */}
                <div className="flex flex-col items-center gap-1 bg-white/10 px-2 md:px-3 py-2 rounded-xl flex-shrink-0">
                  <button
                    className="text-white hover:text-gray-200 transition cursor-pointer"
                    onClick={() => handleUpVote(proposal.id)}
                  >
                    <i className="fa-solid fa-arrow-up text-lg md:text-xl"></i>
                  </button>

                  <span className="text-white font-bold text-sm md:text-lg">
                    {proposal.upvotes - proposal.downvotes}
                  </span>

                  <button
                    className="text-white hover:text-gray-200 transition cursor-pointer"
                    onClick={() => handleDownVote(proposal.id)}
                  >
                    <i className="fa-solid fa-arrow-down text-lg md:text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Propose;
