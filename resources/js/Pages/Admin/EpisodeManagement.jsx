import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { episodeApi } from '@/Services/episodeApi';
import { movieApi } from '@/Services/movieApi';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

const emptyForm = {
    episode_number: '',
    title: '',
    arc_name: '',
    video_url: '',
    video_file: null,
    duration: '',
};

export default function EpisodeManagement() {
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('episode_number');
    const [sortDir, setSortDir] = useState('asc');

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState(emptyForm);

    // Load movie info
    useEffect(() => {
        const loadMovie = async () => {
            try {
                const res = await movieApi.get(movieId);
                if (res.success) {
                    const m = res.data?.data || res.data;
                    setMovie(m);
                }
            } catch (err) {
                console.error('Error loading movie:', err);
            }
        };
        loadMovie();
    }, [movieId]);

    // Fetch episodes
    const fetchEpisodes = useCallback(async (pageNum = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await episodeApi.listByMovie(movieId, {
                page: pageNum,
                search,
                sort_by: sortBy,
                sort_dir: sortDir,
                per_page: 15,
            });

            if (response.success) {
                const apiData = response.data?.data || response.data;
                const items = Array.isArray(apiData?.data) ? apiData.data : (Array.isArray(apiData) ? apiData : []);
                const metaData = apiData?.meta || {};
                setEpisodes(items);
                setMeta(metaData);
                setPage(pageNum);
            } else {
                setError(response.error || 'Lỗi khi tải dữ liệu');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [movieId, search, sortBy, sortDir]);

    useEffect(() => {
        fetchEpisodes(1);
    }, [search, sortBy, sortDir, fetchEpisodes]);

    useEffect(() => {
        if (page > 1) {
            fetchEpisodes(page);
        }
        // eslint-disable-next-line
    }, [page]);

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            ...emptyForm,
            episode_number: episodes.length + 1,
        });
        setShowModal(true);
    };

    const handleEdit = (episode) => {
        setEditingId(episode.id);
        setFormData({
            episode_number: episode.episode_number || '',
            title: episode.title || '',
            arc_name: episode.arc_name || '',
            video_url: episode.video_url || '',
            duration: episode.duration || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.episode_number) {
            setError('Số tập không được để trống');
            return;
        }

        // Check if video URL or file exists
        if (!formData.video_url && !formData.video_file) {
            setError('Vui lòng nhập URL video hoặc upload file video');
            return;
        }

        setFormLoading(true);
        try {
            console.log('=== Episode Submit ===');
            console.log('Episode number:', formData.episode_number);
            console.log('Title:', formData.title);
            console.log('Video URL:', formData.video_url);
            console.log('Video File:', formData.video_file ? {name: formData.video_file.name, size: formData.video_file.size} : null);

            // Use FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('episode_number', parseInt(formData.episode_number));
            formDataToSend.append('title', formData.title || '');
            formDataToSend.append('arc_name', formData.arc_name || '');

            // Nếu có video_file, gửi file. Nếu không, gửi video_url
            if (formData.video_file) {
                console.log('Appending video file to FormData');
                formDataToSend.append('video_file', formData.video_file);
            } else if (formData.video_url) {
                formDataToSend.append('video_url', formData.video_url);
            }

            if (formData.duration) {
                formDataToSend.append('duration', parseInt(formData.duration));
            }

            console.log('FormData entries:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`  ${key}:`, value instanceof File ? {name: value.name, size: value.size} : value);
            }

            let response;
            if (editingId) {
                console.log('Calling updateWithFile for episode:', editingId);
                response = await episodeApi.updateWithFile(editingId, formDataToSend);
            } else {
                console.log('Calling createWithFile for movie:', movieId);
                response = await episodeApi.createWithFile(movieId, formDataToSend);
            }

            console.log('Response:', response);

            if (response.success) {
                setToast({
                    message: editingId ? 'Cập nhật tập phim thành công!' : 'Tạo tập phim thành công!',
                    type: 'success',
                });
                setShowModal(false);
                await fetchEpisodes(1);
            } else {
                setError(response.error || 'Lỗi khi lưu');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tập phim này?')) return;

        setLoading(true);
        try {
            const response = await episodeApi.destroy(id);
            if (response.success) {
                setToast({ message: 'Xóa tập phim thành công!', type: 'success' });
                await fetchEpisodes(page);
            } else {
                setError(response.error || 'Lỗi khi xóa');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Format duration seconds to mm:ss
    const formatDuration = (seconds) => {
        if (!seconds) return '—';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { key: 'episode_number', label: 'Số tập', sortable: true },
        {
            key: 'title',
            label: 'Tiêu đề',
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-semibold">{value || `Tập ${row.episode_number}`}</div>
                    {row.arc_name && (
                        <div className="text-sm text-gray-500">Arc: {row.arc_name}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'duration',
            label: 'Thời lượng',
            sortable: true,
            render: (value) => formatDuration(value),
        },
        {
            key: 'views',
            label: 'Lượt xem',
            sortable: true,
            render: (value) => (value || 0).toLocaleString(),
        },
        {
            key: 'video_url',
            label: 'Video URL',
            sortable: false,
            render: (value) =>
                value ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm truncate block max-w-[200px]"
                        title={value}
                    >
                        {value}
                    </a>
                ) : (
                    <span className="text-gray-400">Chưa có</span>
                ),
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button
                            onClick={() => navigate('/movies')}
                            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1 transition"
                        >
                            ← Quay lại danh sách phim
                        </button>
                        <h1 className="text-4xl font-extrabold text-black uppercase tracking-tight border-b-4 border-black inline-block pb-2">
                            Quản lý tập phim
                        </h1>
                        {movie && (
                            <p className="text-gray-600 mt-1">
                                Phim: <span className="font-semibold text-gray-800">{movie.title}</span>
                                {movie.type && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                                        {movie.type === 'series' ? 'Series' : movie.type === 'movie' ? 'Phim lẻ' : 'Đặc biệt'}
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
                    >
                        + Thêm tập phim
                    </button>
                </div>

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {error && (
                    <Toast message={error} type="error" onClose={() => setError(null)} />
                )}

                {/* Search */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tập phim..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    />
                </div>

                {/* Table */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={episodes}
                                onSort={(col, dir) => {
                                    setSortBy(col);
                                    setSortDir(dir);
                                }}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                rowAction={(row) => (
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="px-3 py-1 text-sm bg-black text-white rounded-none border border-black hover:bg-gray-800 hover:text-white uppercase font-bold transition"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-none hover:bg-red-800 uppercase font-bold transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                                loading={loading}
                            />

                            {meta.last_page > 1 && (
                                <div className="p-4">
                                    <Pagination
                                        currentPage={page}
                                        lastPage={meta.last_page}
                                        total={meta.total}
                                        perPage={meta.per_page}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Episode Form Modal */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Sửa tập phim' : 'Tạo tập phim mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số tập *
                        </label>
                        <input
                            type="number"
                            value={formData.episode_number}
                            onChange={(e) =>
                                setFormData({ ...formData, episode_number: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            placeholder="1"
                            min={1}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề tập
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            placeholder="Nhập tiêu đề tập phim"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên Arc
                        </label>
                        <input
                            type="text"
                            value={formData.arc_name}
                            onChange={(e) =>
                                setFormData({ ...formData, arc_name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            placeholder="VD: Mùa 1, Arc Khai Mở..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL Video
                        </label>
                        <input
                            type="url"
                            value={formData.video_url}
                            onChange={(e) =>
                                setFormData({ ...formData, video_url: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            placeholder="https://..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Hoặc upload file video bên dưới</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Video File
                        </label>
                        <input
                            type="file"
                            accept="video/mp4,video/x-msvideo,video/quicktime,video/x-matroska,video/x-flv,video/x-ms-wmv,video/webm"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFormData({ ...formData, video_file: file });
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Hỗ trợ: mp4, avi, mov, mkv, flv, wmv, webm (tối đa 20GB)
                        </p>
                        {formData.video_file && (
                            <p className="text-sm text-green-600 mt-2">
                                ✓ Đã chọn: {formData.video_file.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thời lượng (giây)
                        </label>
                        <input
                            type="number"
                            value={formData.duration}
                            onChange={(e) =>
                                setFormData({ ...formData, duration: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                            placeholder="VD: 1440 (= 24 phút)"
                            min={0}
                        />
                        {formData.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                                = {formatDuration(parseInt(formData.duration))}
                            </p>
                        )}
                    </div>
                </FormModal>
            </div>
        </div>
    );
}

