import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieApi } from '@/Services/movieApi';
import { genreApi } from '@/Services/genreApi';
import { countryApi } from '@/Services/countryApi';
import { directorApi } from '@/Services/directorApi';
import { actorApi } from '@/Services/actorApi';
import { useResourceManagement } from '@/Hooks/useResourceManagement';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Toast from '@/Components/Toast';

/**
 * MovieManagement - Trang quản trị trung tâm cho danh sách phim.
 * Xử lý CRUD phim và quản lý các mối quan hệ đa-đa (thể loại, diễn viên, đạo diễn, quốc gia).
 */
export default function MovieManagement() {
    try {
        // Sử dụng custom hook useResourceManagement để chuẩn hóa logic CRUD cơ bản
        const {
            items: movies,
            loading,
            error,
            meta,
            page,
            search,
            sortBy,
            sortDir,
            setSearch,
            setPage,
            setSortBy,
            setSortDir,
            fetchItems,
            deleteItem,
            setError,
        } = useResourceManagement(movieApi);

    const navigate = useNavigate();

    // State cho UI và Modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // State lưu trữ danh sách các tài nguyên liên quan để hiển thị trong Form (Dropdown/Checkbox)
    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [actors, setActors] = useState([]);
    const [loadingLists, setLoadingLists] = useState(false);

    // Khởi tạo dữ liệu Form mặc định
    const [formData, setFormData] = useState({
        title: '',
        original_title: '',
        summary: '',
        release_year: new Date().getFullYear(),
        type: 'movie', // movie, series, special
        status: 'draft', // draft, published, archived
        poster: '',
        banner: '',
        trailer_url: '',
        genres: [], // Danh sách ID thể loại
        countries: [], // Danh sách ID quốc gia
        directors: [], // Danh sách ID đạo diễn
        actors: [], // Danh sách ID diễn viên
    });

    // Tự động fetch dữ liệu phim khi các tham số tìm kiếm/sắp xếp thay đổi
    useEffect(() => {
        fetchItems(1);
        // eslint-disable-next-line
    }, [search, sortBy, sortDir]);

    // Xử lý chuyển trang
    useEffect(() => {
        if (page > 1) {
            fetchItems(page);
        }
        // eslint-disable-next-line
    }, [page]);

    /**
     * Helper: Trích xuất mảng dữ liệu từ phản hồi của API
     * Hỗ trợ nhiều định dạng trả về khác nhau từ Backend
     */
    const extractArray = (res) => {
        if (!res?.success) return [];
        const d = res.data;
        if (Array.isArray(d?.data?.data)) return d.data.data;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    };

    /**
     * Tải toàn bộ danh sách bổ trợ (thể loại, quốc gia...) để người dùng chọn trong Modal
     */
    const loadDropdownData = async () => {
        setLoadingLists(true);
        try {
            // Gọi song song 4 API để tối ưu tốc độ
            const [genresRes, countriesRes, directorsRes, actorsRes] = await Promise.all([
                genreApi.list({ per_page: 100 }),
                countryApi.list({ per_page: 100 }),
                directorApi.list({ per_page: 100 }),
                actorApi.list({ per_page: 100 }),
            ]);

            setGenres(extractArray(genresRes));
            setCountries(extractArray(countriesRes));
            setDirectors(extractArray(directorsRes));
            setActors(extractArray(actorsRes));
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu bổ trợ:', err);
            setGenres([]);
            setCountries([]);
            setDirectors([]);
            setActors([]);
        } finally {
            setLoadingLists(false);
        }
    };

    /**
     * Mở modal để tạo phim mới
     */
    const handleCreate = async () => {
        setEditingId(null);
        setFormData({
            title: '',
            original_title: '',
            summary: '',
            release_year: new Date().getFullYear(),
            type: 'movie',
            status: 'draft',
            poster: '',
            banner: '',
            trailer_url: '',
            genres: [],
            countries: [],
            directors: [],
            actors: [],
        });
        await loadDropdownData(); // Phải load dữ liệu liên quan trước khi hiện Form
        setShowModal(true);
    };

    /**
     * Mở modal để chỉnh sửa phim hiện có
     */
    const handleEdit = async (movie) => {
        setEditingId(movie.id);
        // Map dữ liệu từ movie object sang formData (bao gồm cả việc trích xuất ID từ các mảng quan hệ)
        setFormData({
            title: movie.title || '',
            original_title: movie.original_title || '',
            summary: movie.summary || '',
            release_year: movie.release_year || new Date().getFullYear(),
            type: movie.type || 'movie',
            status: movie.status || 'draft',
            poster: movie.poster || '',
            banner: movie.banner || '',
            trailer_url: movie.trailer_url || '',
            genres: movie.genres?.map((g) => g.id) || [],
            countries: movie.countries?.map((c) => c.id) || [],
            directors: movie.directors?.map((d) => d.id) || [],
            actors: movie.actors?.map((a) => a.id) || [],
        });
        await loadDropdownData();
        setShowModal(true);
    };

    /**
     * Quy trình submit phim phức tạp:
     * 1. Lưu thông tin cơ bản của phim (Movie Table).
     * 2. Sau khi có ID phim, tiến hành liên kết (Attach) với các bảng quan hệ.
     */
    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            setError('Tên phim không được để trống');
            return;
        }

        setFormLoading(true);
        try {
            const submitData = {
                title: formData.title,
                original_title: formData.original_title,
                summary: formData.summary,
                release_year: formData.release_year,
                type: formData.type,
                status: formData.status,
                poster: formData.poster,
                banner: formData.banner,
                trailer_url: formData.trailer_url,
            };

            let response;
            if (editingId) {
                response = await movieApi.update(editingId, submitData);
            } else {
                response = await movieApi.create(submitData);
            }

            if (response.success) {
                const movieId = editingId || response.data.id;

                // Xử lý gắn các mối quan hệ (Cần tối ưu hơn bằng cách sync một lần ở backend nếu có thể)
                // Ở đây code đang thực hiện gọi API tuần tự cho từng liên kết

                // Gắn Thể loại
                if (formData.genres.length > 0) {
                    for (const genreId of formData.genres) {
                        await movieApi.attachGenre(movieId, genreId);
                    }
                }

                // Gắn Quốc gia
                if (formData.countries.length > 0) {
                    for (const countryId of formData.countries) {
                        await movieApi.attachCountry(movieId, countryId);
                    }
                }

                // Gắn Đạo diễn
                if (formData.directors.length > 0) {
                    for (const directorId of formData.directors) {
                        await movieApi.attachDirector(movieId, directorId);
                    }
                }

                // Gắn Diễn viên
                if (formData.actors.length > 0) {
                    for (const actorId of formData.actors) {
                        await movieApi.attachActor(movieId, actorId);
                    }
                }

                setToast({
                    message: editingId ? 'Cập nhật phim thành công!' : 'Tạo phim mới thành công!',
                    type: 'success',
                });
                setShowModal(false);
                await fetchItems(1);
            } else {
                setError(response.error || 'Lỗi khi lưu thông tin phim');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    /**
     * Xóa phim
     */
    const handleDelete = async (id) => {
        const success = await deleteItem(id);
        if (success) {
            setToast({ message: 'Đã xóa phim thành công!', type: 'success' });
        }
    };

    // Định nghĩa các cột cho bảng quản lý phim
    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        {
            key: 'title',
            label: 'Tên phim',
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-semibold text-black">{value}</div>
                    <div className="text-sm text-gray-500 italic">{row.original_title}</div>
                </div>
            ),
        },
        { 
            key: 'type', 
            label: 'Loại', 
            sortable: true,
            render: (val) => <span className="uppercase text-xs font-bold">{val}</span>
        },
        { 
            key: 'status', 
            label: 'Trạng thái', 
            sortable: true,
            render: (val) => (
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    val === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                    {val === 'published' ? 'CÔNG KHAI' : 'BẢN NHÁP'}
                </span>
            )
        },
        { key: 'release_year', label: 'Năm', sortable: true },
        {
            key: 'view_count',
            label: 'Lượt xem',
            sortable: true,
            render: (value) => (value || 0).toLocaleString(),
        },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-4xl font-extrabold text-black uppercase tracking-tight border-b-4 border-black inline-block pb-2">
                        Quản lý phim
                    </h1>
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-6 py-3 bg-black text-white font-bold uppercase tracking-wide rounded-none border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                    >
                        + Thêm phim mới
                    </button>
                </div>

                {/* Thông báo (Toast) */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

                {/* Thanh tìm kiếm */}
                <div className="mb-6 bg-white p-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
                    <input
                        type="text"
                        placeholder="Tìm kiếm phim theo tên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-400 rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    />
                </div>

                {/* Bảng dữ liệu */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={movies}
                                onSort={(col, dir) => {
                                    setSortBy(col);
                                    setSortDir(dir);
                                }}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                rowAction={(row) => (
                                    <div className="flex gap-2 justify-center">
                                        {/* Nút điều hướng đến quản lý tập phim */}
                                        <button
                                            onClick={() => navigate(`/movies/${row.id}/episodes`)}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white font-bold rounded-none border border-black hover:bg-blue-700 transition"
                                        >
                                            Tập phim
                                        </button>
                                        <button
                                            onClick={() => handleEdit(row)}
                                            className="px-3 py-1 text-sm bg-black text-white rounded-none border border-black hover:bg-gray-800 uppercase font-bold transition"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-none border border-black hover:bg-red-800 uppercase font-bold transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                                loading={loading}
                            />

                            {/* Phân trang */}
                            {meta.last_page > 1 && (
                                <div className="p-4 bg-gray-50 border-t-2 border-black">
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

                {/* Form Modal: Thêm/Sửa phim */}
                <FormModal
                    isOpen={showModal}
                    title={editingId ? 'Chỉnh sửa thông tin phim' : 'Tạo phim mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                >
                    {loadingLists ? (
                        <div className="p-12 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                            {/* Thông tin cơ bản */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Tên phim *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Nhập tên phim"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Tên gốc</label>
                                    <input
                                        type="text"
                                        value={formData.original_title}
                                        onChange={(e) => setFormData({ ...formData, original_title: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Tên tiếng Anh hoặc tên gốc"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Loại *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none"
                                    >
                                        <option value="movie">Phim lẻ</option>
                                        <option value="series">Series</option>
                                        <option value="special">Đặc biệt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Trạng thái *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none"
                                    >
                                        <option value="draft">Nháp</option>
                                        <option value="published">Công khai</option>
                                        <option value="archived">Lưu trữ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">Năm</label>
                                    <input
                                        type="number"
                                        value={formData.release_year}
                                        onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none"
                                        min={1900}
                                        max={new Date().getFullYear() + 1}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-1">Mô tả nội dung</label>
                                <textarea
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none"
                                    placeholder="Viết tóm tắt phim..."
                                    rows={3}
                                />
                            </div>

                            {/* Section: Relationships (Thể loại, Quốc gia, etc.) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2 uppercase border-b border-gray-300 pb-1">Thể loại</label>
                                    <div className="space-y-1 max-h-40 overflow-y-auto border-2 border-black p-2 bg-gray-50">
                                        {genres.map((genre) => (
                                            <label key={genre.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.genres.includes(genre.id)}
                                                    onChange={(e) => {
                                                        const newGenres = e.target.checked 
                                                            ? [...formData.genres, genre.id]
                                                            : formData.genres.filter(id => id !== genre.id);
                                                        setFormData({ ...formData, genres: newGenres });
                                                    }}
                                                    className="w-4 h-4 border-2 border-black rounded-none accent-black"
                                                />
                                                <span className="text-sm font-medium">{genre.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2 uppercase border-b border-gray-300 pb-1">Quốc gia</label>
                                    <div className="space-y-1 max-h-40 overflow-y-auto border-2 border-black p-2 bg-gray-50">
                                        {countries.map((country) => (
                                            <label key={country.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.countries.includes(country.id)}
                                                    onChange={(e) => {
                                                        const newCountries = e.target.checked 
                                                            ? [...formData.countries, country.id]
                                                            : formData.countries.filter(id => id !== country.id);
                                                        setFormData({ ...formData, countries: newCountries });
                                                    }}
                                                    className="w-4 h-4 border-2 border-black rounded-none accent-black"
                                                />
                                                <span className="text-sm font-medium">{country.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2 uppercase border-b border-gray-300 pb-1">Đạo diễn</label>
                                    <div className="space-y-1 max-h-40 overflow-y-auto border-2 border-black p-2 bg-gray-50">
                                        {directors.map((director) => (
                                            <label key={director.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.directors.includes(director.id)}
                                                    onChange={(e) => {
                                                        const newDirs = e.target.checked 
                                                            ? [...formData.directors, director.id]
                                                            : formData.directors.filter(id => id !== director.id);
                                                        setFormData({ ...formData, directors: newDirs });
                                                    }}
                                                    className="w-4 h-4 border-2 border-black rounded-none accent-black"
                                                />
                                                <span className="text-sm font-medium">{director.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2 uppercase border-b border-gray-300 pb-1">Diễn viên</label>
                                    <div className="space-y-1 max-h-40 overflow-y-auto border-2 border-black p-2 bg-gray-50">
                                        {actors.map((actor) => (
                                            <label key={actor.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-1">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.actors.includes(actor.id)}
                                                    onChange={(e) => {
                                                        const newActors = e.target.checked 
                                                            ? [...formData.actors, actor.id]
                                                            : formData.actors.filter(id => id !== actor.id);
                                                        setFormData({ ...formData, actors: newActors });
                                                    }}
                                                    className="w-4 h-4 border-2 border-black rounded-none accent-black"
                                                />
                                                <span className="text-sm font-medium">{actor.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Media Links */}
                            <div className="space-y-4 border-t-2 border-gray-200 pt-4">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">URL Poster (Ảnh dọc)</label>
                                    <input
                                        type="url"
                                        value={formData.poster}
                                        onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none"
                                        placeholder="https://imgur.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">URL Banner (Ảnh ngang)</label>
                                    <input
                                        type="url"
                                        value={formData.banner}
                                        onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none"
                                        placeholder="https://imgur.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">URL Trailer (Youtube)</label>
                                    <input
                                        type="url"
                                        value={formData.trailer_url}
                                        onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black rounded-none focus:outline-none"
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </FormModal>
            </div>
        </div>
    );
    } catch (err) {
        console.error('Lỗi nghiêm trọng tại MovieManagement:', err);
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="bg-red-50 border-4 border-red-600 text-red-600 px-8 py-6 shadow-[8px_8px_0_0_rgba(220,38,38,1)] font-bold text-center">
                    <h2 className="text-2xl mb-2 uppercase">Hệ thống gặp lỗi</h2>
                    <p className="font-mono text-sm">{err.message}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white uppercase text-xs">Thử lại</button>
                </div>
            </div>
        );
    }
}

