import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Achievement } from 'src/users/entities/achievement.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Like } from 'typeorm';
import { UserStatus } from './constants/user-status.enum';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { AchievementsRepository } from './repositories/achievement.repository';
import { AchievementName } from './constants/achievement-name.enum';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserAchievementsRepository } from './repositories/user-achievement.repository';
import { Match } from 'src/matches/match.entity';
import { MatchType } from 'src/matches/constants/match-type.enum';
import { MatchStatus } from 'src/matches/constants/match-status.enum';
import { MatchesRepository } from 'src/matches/matches.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @InjectRepository(MatchesRepository)
    private readonly matchesRepository: MatchesRepository,
    @InjectRepository(AchievementsRepository)
    private readonly achievementsRepository: AchievementsRepository,
    @InjectRepository(UserAchievementsRepository)
    private readonly userAchievementsRepository: UserAchievementsRepository,
  ) {}

  async getUsers(
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<User[]> {
    const options: any = { order: { name: 'ASC' } };

    if (search) {
      options.where = { name: Like(`%${search}%`) };
    }

    if (perPage) {
      options.take = perPage;
    }

    if (page) {
      options.skip = perPage * (page - 1);
    }

    const [data] = await this.usersRepository.findAndCount(options);

    return data;
  }

  async getUserByName(name: string): Promise<User> {
    const found: User = await this.usersRepository.findOne({ name });
    if (!found) {
      throw new NotFoundException([`User with ${name} not found`]);
    }
    return found;
  }

  async getMatchesByUserName(
    name: string,
    type?: MatchType,
    status?: MatchStatus,
    perPage?: number,
    page?: number,
  ): Promise<Match[]> {
    const user: User = await this.usersRepository.findOne({ name });
    return this.matchesRepository.getMatchesByUser(
      type,
      status,
      perPage,
      page,
      user,
    );
  }

  async getAchievementsByUserName(name: string): Promise<Achievement[]> {
    const user: User = await this.usersRepository.findOne({ name });
    return this.achievementsRepository.getAchievements(user);
  }

  createUser(
    ftId: number,
    name: string,
    enable2FA: boolean,
    avatar?: string,
  ): Promise<User> {
    return this.usersRepository.createUser(ftId, name, enable2FA, avatar);
  }

  updateUser(
    user: User,
    name?: string,
    enable2FA?: boolean,
    avatar?: string,
  ): Promise<User> {
    return this.usersRepository.updateUser(user, name, enable2FA, avatar);
  }

  async updateUserStatus(user: User, status: UserStatus): Promise<User> {
    user.status = status;
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException([
        'server error in updateUserStatus',
      ]);
    }
    return user;
  }

  async updateUserIsSecondFactorUnauthenticated(user: User): Promise<User> {
    user.isSecondFactorAuthenticated = false;
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException([
        'server error in updateUserIsSecondFactorUnauthenticated',
      ]);
    }
    return user;
  }

  async updateUserAuthenticatorSecret(
    user: User,
    secret: string,
  ): Promise<User> {
    user.authenticatorSecret = secret;
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException([
        'server error in updateUserAuthenticatorSecret',
      ]);
    }
    return user;
  }

  getChannelMembers(
    channel: Channel,
    search?: string,
    perPage?: number,
    page?: number,
  ): Promise<User[]> {
    return this.usersRepository.getChannelMembers(
      channel,
      search,
      perPage,
      page,
    );
  }

  async createUserAchievement(
    user: User,
    name: AchievementName,
  ): Promise<UserAchievement> {
    const achievement: Achievement = await this.achievementsRepository.findOne({
      name,
    });

    const userAchievement: UserAchievement =
      this.userAchievementsRepository.create({ user, achievement });

    await this.userAchievementsRepository.save(userAchievement);

    return userAchievement;
  }
}
