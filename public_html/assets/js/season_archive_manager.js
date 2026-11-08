/**
 * Sezon Arşivleme & Yıl Yönetim Modülü (Season Archive Manager)
 * 2026 Arşivleme, 2027 Yeni Yıla Geçiş ve Geçmiş Yılları İnceleme Yönetimi
 */

(function() {
    const DEFAULT_ACTIVE_YEAR = '2026';
    const GADGEN_ID = localStorage.getItem('selected_garden_id') || '1';

    const SEASONAL_STORAGE_KEYS = [
        'treatmentRecords',
        'irrigationRecords',
        'herbicide_records',
        'puantajData',
        'cariData',
        'cari_records',
        'agendaEvents',
        'irrigation_schedule'
    ];

    window.SeasonManager = {
        getActiveYear: function() {
            return localStorage.getItem('active_season_year') || DEFAULT_ACTIVE_YEAR;
        },

        getAvailableSeasons: function() {
            const list = JSON.parse(localStorage.getItem('available_seasons') || '["2026"]');
            if (!list.includes(DEFAULT_ACTIVE_YEAR)) list.push(DEFAULT_ACTIVE_YEAR);
            return Array.from(new Set(list)).sort();
        },

        hasPermission: function() {
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'admin') return true;

            const permissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
            if (permissions.seasonArchive === false) return false;
            if (permissions.hidden && (permissions.hidden.includes('season_archive') || permissions.hidden.includes('season_archive.html'))) return false;

            return true;
        },

        isArchiveMode: function() {
            const activeYear = this.getActiveYear();
            const latestYear = Math.max(...this.getAvailableSeasons().map(Number)).toString();
            return activeYear !== latestYear;
        },

        switchSeason: function(targetYear) {
            if (!this.hasPermission()) {
                alert("Sezon değiştirme yetkiniz bulunmamaktadır!");
                return;
            }
            const currentYear = this.getActiveYear();
            if (currentYear === targetYear) return;

            localStorage.setItem('active_season_year', targetYear);
            window.location.reload();
        },

        archiveAndCreateNextSeason: function(nextYear) {
            if (!this.hasPermission()) {
                alert("Sezon arşivleme yetkiniz bulunmamaktadır!");
                return;
            }

            const currentYear = this.getActiveYear();
            const archivePrefix = `archive_${currentYear}_g${GADGEN_ID}_`;

            // 1. Copy current seasonal data to archive storage keys
            SEASONAL_STORAGE_KEYS.forEach(key => {
                const currentData = localStorage.getItem(key);
                if (currentData) {
                    localStorage.setItem(archivePrefix + key, currentData);
                }
            });

            // 2. Clear current workspace data for new year (Fresh slate)
            SEASONAL_STORAGE_KEYS.forEach(key => {
                localStorage.removeItem(key);
            });

            // 3. Update available seasons list
            const seasons = this.getAvailableSeasons();
            if (!seasons.includes(nextYear)) {
                seasons.push(nextYear);
                localStorage.setItem('available_seasons', JSON.stringify(seasons));
            }

            // 4. Set active season year to next year
            localStorage.setItem('active_season_year', nextYear);

            alert(`✅ ${currentYear} sezonu başarıyla arşivlendi! ${nextYear} yeni çalışma yılı başlatıldı.`);
            window.location.reload();
        },

        renderSeasonUI: function() {
            const canAccess = this.hasPermission();

            // Hide Navbar Season Selector if user has no permission
            document.querySelectorAll('.season-selector-nav').forEach(el => {
                if (!canAccess) el.style.display = 'none';
            });

            const seasonArchiveCard = document.getElementById('seasonArchiveCard');
            if (seasonArchiveCard && !canAccess) {
                seasonArchiveCard.style.display = 'none';
            }

            if (!canAccess) return;

            const activeYear = this.getActiveYear();
            document.querySelectorAll('.seasonYearDisplayBadge').forEach(el => el.textContent = activeYear);

            const menu = document.getElementById('navbarSeasonMenu');
            if (menu) {
                const seasons = this.getAvailableSeasons();
                const latestYear = Math.max(...seasons.map(Number)).toString();
                menu.innerHTML = `
                    <li><h6 class="dropdown-header text-muted">Çalışma / Arşiv Yılı</h6></li>
                    ${seasons.map(yr => `
                        <li><a class="dropdown-item ${yr === activeYear ? 'active text-warning fw-bold' : ''}" href="#" onclick="SeasonManager.switchSeason('${yr}')"><i class="bi bi-calendar-check me-1"></i>${yr} Sezonu ${yr === latestYear ? '(Aktif)' : '(Arşiv)'}</a></li>
                    `).join('')}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-warning fw-bold" href="gardens.html"><i class="bi bi-archive me-1"></i>Sezon Arşiv Yönetimi</a></li>
                `;
            }
        },

        renderSeasonBanner: function() {
            if (this.isArchiveMode() && this.hasPermission()) {
                const year = this.getActiveYear();
                const banner = document.createElement('div');
                banner.id = 'archiveNoticeBanner';
                banner.style.cssText = 'background: #fef3c7; color: #92400e; border-bottom: 2px solid #f59e0b; padding: 8px 16px; text-align: center; font-weight: 700; font-size: 0.9rem; position: sticky; top: 0; z-index: 1050; display: flex; justify-content: center; align-items: center; gap: 12px;';
                banner.innerHTML = `
                    <span><i class="bi bi-archive-fill me-1"></i>⚠️ <strong>${year} Sezonu Arşivi İnceleniyor</strong> (Salt Okunur Mod)</span>
                    <button onclick="SeasonManager.switchSeason('${Math.max(...SeasonManager.getAvailableSeasons().map(Number))}')" class="btn btn-sm btn-warning rounded-pill px-3 py-0 fw-bold">Güncel Sezona Dön</button>
                `;
                document.body.prepend(banner);
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        SeasonManager.renderSeasonUI();
        SeasonManager.renderSeasonBanner();
    });

})();
