import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { episodeApi } from '@/Services/episodeApi';
import { movieApi } from '@/Services/movieApi';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

/**
 * Khởi tạo dữ liệu trống cho Form tập phim.
 * Phục vụ việc reset form khi tạo mới.
 */
const emptyForm = {
    episode_number: '',
    title: '',
    arc_name: '',
    video_url: '',
    video_file: null, // Dùng cho trường hợp upload file video trực tiếp từ máy tính.
    duration: '',
};

/**
 * EpisodeManagement - Thành phần quản lý danh sách tập phim cho một bộ phim cụ thể.
 * 
 * Các tính năng chính:
 * 1. Hiển thị danh sách tập phim thuộc về một Movie ID (lấy từ URL params).
 * 2. Hỗ trợ tạo mới tập phim (tự động gợi ý số tập kế tiếp).
 * 3. Hỗ trợ chỉnh sửa thông tin tập phim (Số tập, Tiêu đề, Arc, Video Source).
 * 4. Xử lý Upload video file (multipart/form-data) hoặc sử dụng Link video (URL).
 * 5. Định dạng thời lượng tập phim (giây sang mm:ss).
 */
export default function EpisodeManagement() {
    const { movieId } = useParams(); // Lấy ID phim từ URL thông qua React Router.
    const navigate = useNavigate();

    // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
    const [movie, setMovie] = useState(null);       // Lưu thông tin phim cha để hiển thị tiêu đề.
    const [episodes, setEpisodes] = useState([]);   // Danh sách các tập phim đã lấy từ server.
    const [loading, setLoading] = useState(false);  // Trạng thái tải dữ liệu danh sách.
    const [error, setError] = useState(null);      // Thông báo lỗi hệ thống.
    const [meta, setMeta] = useState({});           // Thông tin phân trang của Laravel.
    const [page, setPage] = useState(1);            // Trang hiện tại.
    const [search, setSearch] = useState('');       // Từ khóa tìm kiếm tập phim.
    const [sortBy, setSortBy] = useState('episode_number'); // Mặc định sắp xếp theo số thứ tự tập.
    const [sortDir, setSortDir] = useState('asc');  // Hướng sắp xếp: Tăng dần.

    // --- CÁC STATE QUẢN LÝ MODAL & FORM ---
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);   // ID tập phim đang sửa (null = tạo mới).
    const [formLoading, setFormLoading] = useState(false);
    const [toast, setToast] = useState(null);           // Thông báo Toast thành công/thất bại.
    const [formData, setFormData] = useState(emptyForm);

    /**
     * Tải thông tin cơ bản của bộ phim hiện tại.
     * Giúp người dùng biết mình đang quản lý tập phim cho bộ phim nào.
     */
    useEffect(() => {
        const loadMovie = async () => {
            try {
                const res = await movieApi.get(movieId);
                if (res.success) {
                    const m = res.data?.data || res.data;
                    setMovie(m);
                }
            } catch (err) {
                console.error('Lỗi khi tải thông tin phim:', err);
            }
        };
        loadMovie();
    }, [movieId]);

    /**
     * fetchEpisodes: Hàm lấy danh sách tập phim từ API với các tham số lọc.
     * Sử dụng useCallback để tránh việc khởi tạo lại hàm gây loop trong useEffect.
     */
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
                setError(response.error || 'Lỗi khi tải danh sách tập phim');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [movieId, search, sortBy, sortDir]);

    /**
     * Effect: Theo dõi các thay đổi về tiêu chí lọc (Search, Sort) để tải lại dữ liệu từ trang 1.
     */
    useEffect(() => {
        fetchEpisodes(1);
    }, [search, sortBy, sortDir, fetchEpisodes]);

    /**
     * Effect: Theo dõi việc chuyển trang để tải dữ liệu trang tương ứng.
     */
    useEffect(() => {
        if (page > 1) {
            fetchEpisodes(page);
        }
        // eslint-disable-next-line
    }, [page]);

    /**
     * handleCreate: Khởi tạo form cho việc thêm mới tập phim.
     * Tự động tính toán số tập tiếp theo dựa trên số lượng tập hiện có để tiện cho Admin.
     */
    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            ...emptyForm,
            episode_number: episodes.length + 1,
        });
        setShowModal(true);
    };

    /**
     * handleEdit: Nạp dữ liệu của một tập phim vào form để chỉnh sửa.
     */
    const handleEdit = (episode) => {
        setEditingId(episode.id);
        setFormData({
            episode_number: episode.episode_number || '',
            title: episode.title || '',
            arc_name: episode.arc_name || '',
            video_url: episode.video_url || '',
            duration: episode.duration || '',
            video_file: null, // Quan trọng: Luôn reset file upload, bắt buộc người dùng chọn lại nếu muốn thay thế video.
        });
        setShowModal(true);
    };

    /**
     * handleSubmit: Gửi dữ liệu tập phim tới server.
     * Xử lý đặc biệt: Sử dụng FormData để có thể gửi tệp tin video nhị phân.
     */
    const handleSubmit = async () => {
        // Kiểm tra dữ liệu bắt buộc.
        if (!formData.episode_number) {
            setError('Số tập không được để trống');
            return;
        }

        // Kiểm tra nguồn video: Phải có Link URL hoặc File upload.
        if (!formData.video_url && !formData.video_file) {
            setError('Vui lòng cung cấp URL video hoặc tải lên file video');
            return;
        }

        setFormLoading(true);
        try {
            // Chuyển đổi dữ liệu sang đối tượng FormData cho multipart/form-data.
            const formDataToSend = new FormData();
            formDataToSend.append('episode_number', parseInt(formData.episode_number));
            formDataToSend.append('title', formData.title || '');
            formDataToSend.append('arc_name', formData.arc_name || '');

            // Ưu tiên tệp tin video nếu được chọn.
            if (formData.video_file) {
                formDataToSend.append('video_file', formData.video_file);
            } else if (formData.video_url) {
                // Nếu không có tệp tin, sử dụng đường dẫn URL.
                formDataToSend.append('video_url', formData.video_url);
            }

            if (formData.duration) {
                formDataToSend.append('duration', parseInt(formData.duration));
            }

            let response;
            if (editingId) {
                // Thực hiện cập nhật tập phim hiện có.
                response = await episodeApi.updateWithFile(editingId, formDataToSend);
            } else {
                // Tạo mới tập phim cho bộ phim đang quản lý.
                response = await episodeApi.createWithFile(movieId, formDataToSend);
            }

            if (response.success) {
                setToast({
                    message: editingId ? 'Cập nhật tập phim thành công!' : 'Thêm tập phim thành công!',
                    type: 'success',
                });
                setShowModal(false);
                await fetchEpisodes(1); // Quay lại trang đầu để xem kết quả mới nhất.
            } else {
                setError(response.error || 'Lỗi hệ thống khi lưu tập phim');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * handleDelete: Xóa vĩnh viễn một tập phim.
     */
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tập phim này? Hành động này không thể hoàn tác.')) return;

        setLoading(true);
        try {
            const response = await episodeApi.destroy(id);
            if (response.success) {
                setToast({ message: 'Đã xóa tập phim!', type: 'success' });
                await fetchEpisodes(page);
            } else {
                setError(response.error || 'Không thể xóa tập phim');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * formatDuration: Chuyển đổi số giây thành định dạng thời gian mm:ss dễ nhìn.
     */
    const formatDuration = (seconds) => {
        if (!seconds) return '—';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    // Định nghĩa các cột cho bảng quản lý tập phim.
    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { 
            key: 'episode_number', 
            label: 'Số tập', 
            sortable: true,
            render: (val) => <span className="font-black text-lg">Tập {val}</span>
        },
        {
            key: 'title',
            label: 'Tiêu đề / Phần (Arc)',
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-bold text-black">{value || `Tập ${row.episode_number}`}</div>
                    {row.arc_name && (
                        <div className="text-xs text-gray-500 uppercase tracking-tighter italic">Arc: {row.arc_name}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'duration',
            label: 'Thời lượng',
            sortable: true,
            render: (value) => <span className="font-mono bg-gray-100 px-2 py-1 border border-gray-300">{formatDuration(value)}</span>,
        },
        {
            key: 'views',
            label: 'Lượt xem',
            sortable: true,
            render: (value) => <span className="font-bold">{(value || 0).toLocaleString()}</span>,
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
                        className="text-blue-600 hover:underline text-sm truncate block max-w-[150px]"
                        title={value}
                    >
                        {value}
                    </a>
                ) : (
                    <span className="text-gray-400 italic">File Uploaded</span>
                ),
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* PHẦN ĐẦU TRANG: ĐIỀU HƯỚNG VÀ TIÊU ĐỀ */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/movies')}
                            className="text-black hover:bg-black hover:text-white mb-4 flex items-center gap-1 transition-all border-2 border-black px-4 py-1 font-black uppercase text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none"
                        >
                            ← Quay lại phim
                        </button>
                        <h1 className="text-4xl font-black text-black uppercase tracking-tighter border-b-8 border-black pb-2">
                            Quản lý tập phim
                        </h1>
                        {movie && (
                            <div className="mt-4 flex items-center gap-3">
                                <span className="font-bold text-gray-500 uppercase text-sm">Phim đang chọn:</span>
                                <span className="px-4 py-1 bg-yellow-400 text-black font-black uppercase border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                                    {movie.title}
                                </span>
                                {movie.type && (
                                    <span className="px-2 py-0.5 text-[10px] font-black border-2 border-black uppercase">
                                        {movie.type}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-8 py-3 bg-black text-white border-2 border-black font-black uppercase transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] hover:bg-gray-900 disabled:opacity-50 h-fit"
                    >
                        + Thêm tập mới
                    </button>
                </div>

                {/* THÔNG BÁO HỆ THỐNG */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

                {/* THANH TÌM KIẾM */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tập theo tiêu đề, tên Arc..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black outline-none transition-colors"
                    />
                </div>

                {/* DANH SÁCH TẬP PHIM */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center gap-4">
                            <LoadingSpinner />
                            <span className="font-black uppercase tracking-widest text-gray-400">Đang tải dữ liệu tập phim...</span>
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
                                            className="px-4 py-1 text-xs bg-black text-white border border-black font-black uppercase hover:bg-gray-800 transition"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="px-4 py-1 text-xs bg-white text-red-600 border border-red-600 font-black uppercase hover:bg-red-50 transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                                loading={loading}
                            />

                            {/* PHÂN TRANG */}
                            {meta.last_page > 1 && (
                                <div className="p-4 border-t-2 border-black bg-gray-50">
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

                {/* MODAL FORM TẬP PHIM */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? `Sửa tập ${formData.episode_number}` : 'Thêm tập mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* TRƯỜNG: SỐ TẬP */}
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">
                                    Số tập <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.episode_number}
                                    onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-black text-xl"
                                    placeholder="VD: 1"
                                    min={1}
                                />
                            </div>
                            {/* TRƯỜNG: THỜI LƯỢNG */}
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">
                                    Thời lượng (giây)
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-bold"
                                    placeholder="VD: 1440"
                                />
                                {formData.duration && (
                                    <p className="text-xs text-gray-500 mt-2 font-mono italic">
                                        Quy đổi: {formatDuration(parseInt(formData.duration))}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* TRƯỜNG: TIÊU ĐỀ TẬP */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Tiêu đề tập phim
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50 font-bold"
                                placeholder="Nhập tiêu đề tập (VD: Khởi đầu mới...)"
                            />
                        </div>

                        {/* TRƯỜNG: TÊN ARC */}
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Tên Arc / Phần (Saga)
                            </label>
                            <input
                                type="text"
                                value={formData.arc_name}
                                onChange={(e) => setFormData({ ...formData, arc_name: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50"
                                placeholder="VD: Wano Country Arc, Season 1..."
                            />
                        </div>

                        {/* PHẦN QUẢN LÝ NGUỒN VIDEO */}
                        <div className="border-t-4 border-black pt-6">
                            <label className="block text-md font-black text-black uppercase mb-2">
                                Nguồn Video (Chọn 1 trong 2)
                            </label>
                            
                            {/* NHẬP LINK URL */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đường dẫn URL (HLS, MP4, Youtube...)</label>
                                <input
                                    type="url"
                                    value={formData.video_url}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:bg-yellow-50"
                                    placeholder="Dán link video tại đây..."
                                />
                            </div>
                            
                            {/* UPLOAD FILE */}
                            <div className="bg-gray-100 p-6 border-4 border-dashed border-gray-300 text-center relative group hover:border-black transition-colors">
                                <label className="cursor-pointer">
                                    <span className="text-sm font-black text-black uppercase block mb-2">Hoặc Tải lên File Video</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setFormData({ ...formData, video_file: file });
                                        }}
                                        className="hidden"
                                    />
                                    <div className="text-xs font-bold text-gray-500 bg-white border-2 border-black inline-block px-4 py-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] group-hover:bg-yellow-400 group-hover:text-black">
                                        {formData.video_file 
                                            ? `✓ FILE ĐÃ CHỌN: ${formData.video_file.name} (${(formData.video_file.size / (1024*1024)).toFixed(2)} MB)` 
                                            : "CHỌN FILE TỪ THIẾT BỊ"}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </FormModal>
            </div>
        </div>
    );
}
