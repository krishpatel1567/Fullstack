import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTweetStore } from "../store/tweetStore";

export default TweetPage = () => {
  const navigate = useNavigate();
  const { tweets, isLoading, error, getUserTweet, createTweet, updateTweet, deleteTweet, getAllTweets, toggleLike } = useTweetStore()
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    getAllTweets()
  }, [])

  const onSubmit = async (data) => {
    try {
      let result;

      if (editingId) {
        result = await updateTweet(editingId, data.content);
        toast.success('Tweet updated! ✏️');
        setEditingId(null);
      } else {
        result = await createTweet(data.content);
        toast.success('Tweet posted! 🎉');
      }

      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (tweet) => {
    setEditingId(tweet._id);
    reset({ content: tweet.content });   // pushes value into the form field
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();   // clears back to empty
  };

  return (
    <div className="max-w-600px mx-auto px-4">
      <h1>Tweets</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-3">
        <textarea
          {...register('content', {
            required: 'Tweet content required',
            maxLength: { value: 280, message: 'Max 280 characters' }
          })}
          placeholder="What's on your mind?"
          rows={3}
          className="w-full p-4 text-lg font-normal"
        />
        {errors.content && <p className="text-red-500">{errors.content.message}</p>}

        <div className="mt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-3 py-2 mr-2 rounded-full text-lg font-bold cursor-pointer ${isLoading ? 'bg-gray-300' : 'bg-blue-500'
              } ${isLoading ? 'pointer-events-none' : ''}`}
          >
            {isLoading ? 'Posting...' : editingId ? '✏️ Update' : '➕ Tweet'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-2 rounded-full text-lg font-bold cursor-pointer bg-gray-400 text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading && <p>Loading tweets...</p>}

      {tweets.map(tweet => (
        <div
          key={tweet._id}
          className={`border border-gray-300 p-4 mb-2 rounded-lg ${editingId === tweet._id ? 'bg-gray-100' : ''
            }`}
        >
          <h4 className="mb-2">{tweet.owner?.username}</h4>
          <p className="pb-2">{tweet.content}</p>
          <small className="text-gray-600">
            {new Date(tweet.createdAt).toLocaleString()}
          </small>

          <div className="mt-2">
            <button
              onClick={() => toggleLike(tweet._id)}
              className={`px-2 py-1 mr-2 bg-green-500 text-white rounded-full cursor-pointer`}
            >
              ❤️ Like ({tweet.likes || 0})
            </button>

            {/* EDIT BUTTON */}
            <button
              onClick={() => handleEdit(tweet)}
              className="px-2 py-1 mr-2 bg-blue-500 text-white rounded-full cursor-pointer"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => {
                if (window.confirm('Delete this tweet?')) {
                  deleteTweet(tweet._id);
                  toast.success('Deleted!');
                }
              }}
              className="px-2 py-1 bg-red-500 text-white rounded-full cursor-pointer"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

}